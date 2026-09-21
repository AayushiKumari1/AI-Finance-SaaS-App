import mongoose from "mongoose"
import ReportModel from "../models/report.model.js"
import ReportSettingModel, { ReportFrequencyEnum } from "../models/report_setting.model.js"
import transactionModel, { TransactionTypeEnum } from "../models/transaction.model.js"
import { NotFoundException } from "../utils/app_error.js"
import { calculateNextReportDate } from "../utils/helper.js"
import type { UpdateReportSettingType } from "../validators/report.validator.js"
import { convertToDollarUnit } from "../utils/format_currency.js"
import { genAI, genAIModel } from "../config/google-ai.config.js"
import { createUserContent } from "@google/genai"
import { reportInsightPrompt } from "../utils/prompt.js"
import { format } from "date-fns"

export const getAllReportService = async( userId: string, pagination:{
    pageSize:number,
    pageNumber:number
}) =>{
    const query : Record<string, any> = { userId }

    const { pageSize, pageNumber } = pagination
    const skip = ( pageNumber - 1 ) * pageSize

    const [ reports, totalCount ] = await Promise.all([
        ReportModel.find(query).skip(skip).limit(pageSize).sort({ createdAt: -1 }),
        ReportModel.countDocuments(query)
    ])
    
    const totalPages = Math.ceil(totalCount / pageSize)

    return{
        reports,
        pagination:{
            pageSize,
            pageNumber,
            totalCount,
            totalPages,
            skip,
        }
    }
}

export const updateReportSettingService = async( userId : string, body: UpdateReportSettingType ) =>{

    const { isEnabled } = body
    let nextReportDate: Date | null = null

    const exsistingReportSetting = await ReportSettingModel.findOne({
        userId,
    })

    if( !exsistingReportSetting ){
        throw new NotFoundException("Report Setting Not Found.")
    }

    // const frequency = exsistingReportSetting.frequency || ReportFrequencyEnum.MONTHLY

    if( isEnabled ){

        const currentNextReportDate = exsistingReportSetting.nextReportDate

        const now = new Date()

        if( !currentNextReportDate || currentNextReportDate <= now ){
            nextReportDate = calculateNextReportDate(
                exsistingReportSetting.lastSentDate
            )
        }
        else{
            nextReportDate = currentNextReportDate
        }
    }

    console.log(nextReportDate, "Next Report Date")

    exsistingReportSetting.set({
        ...body,
        nextReportDate,
    })

    await exsistingReportSetting.save()
}

export const generateReportService = async( userId: string, fromDate: Date, toDate: Date ) =>{

    const results = await transactionModel.aggregate([
        {
            $match:{
                userId: new mongoose.Types.ObjectId(userId),
                date : { $gte: fromDate, $lte: toDate },
            },
        },
        {
            $facet:{
                summary:[
                    {
                        $group:{
                            _id:null,
                            totalIncome:{
                                $sum:{
                                    $cond:[
                                        {$eq: ["$type", TransactionTypeEnum.INCOME] },
                                        { $abs: {
                                            $convert: {
                                                input: "$amount",
                                                to: "double",
                                                onError: 0,
                                                onNull: 0,
                                            },
                                        },
                                    },
                                    0,
                                    ],
                                },
                            },

                            totalExpenses:{
                                $sum:{
                                    $cond:[
                                        {$eq: ["$type", TransactionTypeEnum.EXPENSE] },
                                        { $abs: {
                                            $convert: {
                                                input: "$amount",
                                                to: "double",
                                                onError: 0,
                                                onNull: 0,
                                            },
                                        },
                                    },
                                    0,
                                    ],
                                },
                            }
                        },
                    },
                ],

                categories:[
                    {
                        $match:{
                            type: TransactionTypeEnum.EXPENSE
                        },
                    }, 
                        {
                            $group: {
                                _id: "$category",
                                total: { $sum: 
                                { $abs: {
                                    $convert: {
                                    input: "$amount",
                                    to: "double",
                                    onError: 0,
                                    onNull: 0,
                                },
                                },
                            },
                        },
                            }
                        },
                        {
                            $sort: { total: -1 },
                        },
                        {
                            $limit: 5,
                        },
                    ],
                },
            },
            {
            $project: {
                totalIncome : { $arrayElemAt : [ "$summary.totalIncome", 0 ] },
                totalExpenses : { $arrayElemAt: ["$summary.totalExpenses", 0 ] },
                categories : "$categories",
            },
        },
    ])

    if( !results?.length || ( results[0]?.totalIncome === 0 && results[0]?.totalExpense === 0 ) ) return null

    const { totalIncome, totalExpenses, categories } = results[0] || {}
    
    const byCategory = categories.reduce(
        ( acc : any, { _id, total }:any ) =>{
            acc[_id] = {
                amount: convertToDollarUnit(total),
                percentage: totalExpenses > 0 ? Math.round( ( total/totalExpenses ) * 100 ) : 0,
            }

            return acc
        },
        {} as Record<string, { amount: number; percentage: number }>
    )
    
    const availableBalance = totalIncome - totalExpenses

    const savingsRate = calculateSavingRate(totalIncome, totalExpenses)

    const periodLabel = `${format(fromDate, "MMMMM d")} - ${format(toDate, "d, yyyy")}`

    const insights = await generateInsightsAI({
        totalIncome,
        totalExpenses,
        availableBalance,
        savingsRate,
        categories: byCategory,
        periodLabel: periodLabel,
    })

    return{
        period : periodLabel,
        summary: {
            income :  convertToDollarUnit(totalIncome),
            expenses : convertToDollarUnit(totalExpenses),
            balance : convertToDollarUnit(availableBalance),
            savingsRate: Number( savingsRate.toFixed(1)),
            topCategories: Object.entries(byCategory)?.map(
                ([name, cat]: any) => ({
                name,
                amount: cat.amount,
                percent: cat.percentage,
            })),
        },
        insights,
    }
}

async function generateInsightsAI({
    totalIncome,
    totalExpenses,
    availableBalance,
    savingsRate,
    categories,
    periodLabel,
}: {
    totalIncome : number,
    totalExpenses : number,
    availableBalance : number,
    savingsRate : number,
    categories : Record<string, { amount: number; percentage:number } >,
    periodLabel : string,
}) {
    try{
        const prompt = reportInsightPrompt({
            totalIncome : convertToDollarUnit(totalIncome),
            totalExpenses : convertToDollarUnit(totalExpenses),
            availableBalance : convertToDollarUnit(availableBalance),
            savingsRate : Number(savingsRate.toFixed(1)),
            categories,
            periodLabel,
        })

        console.log("AI Prompt", prompt)

        const result = await genAI.models.generateContent({
            model: genAIModel,
            contents : [ createUserContent([prompt]) ],
            config: {
                responseMimeType : "application/json"
            },
        })

        const response = result.text

        console.log(response)
        
        const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim()

        if( ! cleanedText ) return []

        const data = JSON.parse(cleanedText)
        return data

    }
    catch(error){

        return []
    }
}

function calculateSavingRate( totalIncome : number, totalExpenses : number ) {

    if( totalIncome <= 0 ) return 0

    const savingRate = (( totalIncome - totalExpenses )/ totalIncome) * 100

    return parseFloat(savingRate.toFixed(1))
}



