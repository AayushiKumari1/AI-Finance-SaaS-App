import { endOfMonth, startOfMonth, subMonths } from "date-fns"
import type { UserDocument } from "../../models/user.model.js"
import mongoose from "mongoose"
import ReportModel, { ReportStatusEnum } from "../../models/report.model.js"
import { calculateNextReportDate } from "../../utils/helper.js"
import { format } from "date-fns"
import ReportSettingModel from "../../models/report_setting.model.js"
import { generateReportService } from "../../services/report.service.js"
import { sendReportEmail } from "../../mailers/report.mailer.js"

export const processReportJob = async() =>{

    const now = new Date()

    let processedCount = 0
    let failedCount = 0

    // July 1st we will get data from June 1st
    const from = startOfMonth(subMonths(now,1))
    const to = endOfMonth(subMonths(now,1))

    // const from = "2026-04-1T23:00:00:000Z"
    // const to = "2026-04-T23:00:00.000Z"

    try{
        // const reportSettingCursor = ReportSettingModel.find({

        //     isEnabled:true,
        //     nextReportDate: { $lte: now },
        // }).populate<{userId:UserDocument}>("userId").cursor()

        // console.log("Running Report")

    console.log("NOW:", now)

    const allSettings = await ReportSettingModel.find({}).lean()

    console.log("ALL REPORT SETTINGS:", allSettings)

    const eligibleSettings = await ReportSettingModel.find({
        isEnabled: true,
        nextReportDate: { $lte: now },
    }).lean()

    console.log("ELIGIBLE REPORT SETTINGS:", eligibleSettings)

    const reportSettingCursor = ReportSettingModel.find({
        isEnabled: true,
        nextReportDate: { $lte: now },
    })
    .populate<{userId: UserDocument}>("userId")
    .cursor()

    console.log("Running Report")

        for await ( const setting of reportSettingCursor ){

            const user = setting.userId as UserDocument

            if( !user ){

                console.log(`User not found for setting : ${setting._id}`)
                continue
            }

            console.log("========== REPORT USER ==========")
            console.log("SETTING ID:", setting._id)
            console.log("USER ID:", user._id)
            console.log("USER NAME:", user.name)
            console.log("USER EMAIL:", user.email)
            console.log("=================================")

            const session = await mongoose.startSession()

            try{
                const report = await generateReportService( user.id, from, to )

                console.log(report, "Report Data")

                let emailSent = false

                if( report ){

                    try{
                        await sendReportEmail({
                            email: user.email!,
                            username: user.name!, 
                            report: {
                                period: report.period,
                                totalIncome: report.summary.income,
                                totalExpenses: report.summary.expenses,
                                availableBalance: report.summary.balance,
                                savingsRate: report.summary.savingsRate,
                                topSpendingCategories: report.summary.topCategories,
                                insights: report.insights,
                            },
                            frequency : setting.frequency!,
                        })
                        emailSent = true
                    }
                    catch(error){

                        console.log(`Email failed for ${user.id}`)
                    }
                }

                await session.withTransaction( async() =>{
                    const bulkReports : any[] = []
                    const bulkSetting : any[] = []

                    if( report && emailSent ){
                        
                        bulkReports.push({

                            insertOne : {

                                document : {
                                    userId: user.id,
                                    sentDate : now,
                                    period : report?.period || `${format(from, 'MMMM d')} - ${format(to, "d, yyyy")}`, 
                                    status: ReportStatusEnum.SENT,
                                    createdAt: now,
                                    updatedAt : now,
                                },
                            },
                        })

                        bulkSetting.push({

                            updateOne : {
                                filter : { _id : setting._id },
                                update: {
                                    $set: {
                                        lastSentDate: now,
                                        nextReportDate : calculateNextReportDate(now),
                                        updatedAt: now,
                                    }
                                }
                            },
                        })
                    }

                    await Promise.all([
                        ReportModel.bulkWrite( bulkReports, { ordered: false, session } ),
                        ReportSettingModel.bulkWrite( bulkSetting, { ordered: false, session } )
                    ])
                },
                {
                    maxCommitTimeMS : 10000,
                }
            )

                processedCount++
            }
            catch(error){

                console.log(`Failed to process Report`, error )
                
                failedCount++
            }
            finally{
                await session.endSession()
            }
        }

        console.log(`Processed : ${processedCount} report`)
        console.log(`Failed : ${failedCount} report`)

        return{
            success:true,
            processedCount,
            failedCount
        }
    }
    catch(error){

        console.error("Error Processing Reports", error)
        
        return {
            success: false,
            error: "Report Process Failed",
        }
    }
}