import axios from "axios";
import transactionModel, { TransactionTypeEnum } from "../models/transaction.model.js";
import { BadRequestException, NotFoundException } from "../utils/app_error.js";
import { calculateNextOccurrence } from "../utils/helper.js";
import type { createTransactionType, UpdateTransactionType } from "../validators/transaction.validator.js";
import { genAI, genAIModel } from "../config/google-ai.config.js";
import { createPartFromBase64, createUserContent } from "@google/genai";
import { receiptPrompt } from "../utils/prompt.js"

export const createTransactionService = async( body : createTransactionType, userId : string ) =>{

    let nextRecurringDate : Date | undefined
    const currentDate = new Date()

    if( body.isRecurring && body.recurringInterval ){

        const calculateDate = calculateNextOccurrence(body.date, body.recurringInterval)

        nextRecurringDate = calculateDate < currentDate ?
        calculateNextOccurrence(currentDate, body.recurringInterval) : calculateDate
    }

    const transactions = await transactionModel.create({

        ...body,
        userId,
        category : body.category,
        amount : Number(body.amount),
        isRecurring : body.isRecurring || false,
        recurringInterval : body.recurringInterval || null,
        nextRecurringDate,
        lastProcessed : null,
    })

    return transactions
}

export const getAllTransactionService = async( userId : string, filters : {
    keyword?: string,
    type?: keyof typeof TransactionTypeEnum,
    recurringStatus ?: "RECURRING" | "NON_RECURRING"
},
pagination : {
    pageSize : number,
    pageNumber : number
}
) =>{

    const { keyword, type, recurringStatus } = filters

    const filterConditions : Record<string, any> = {
        userId,
    }

    if( keyword ){
        filterConditions.$or = [

            { title : { $regex : keyword, $options: "i" } },
            { category : { $regex : keyword, $options: "i" } },
        ]
    }

    if( type ){
        filterConditions.type = type
    }

    if( recurringStatus ){
        if( recurringStatus === "RECURRING" ){
            filterConditions.isRecurring = true 
        }
        else if( recurringStatus === "NON_RECURRING" ){

            filterConditions.isRecurring = false
        }
    }

    const { pageSize, pageNumber } = pagination
    const skip = ( pageNumber - 1 ) * pageSize

    const [ transaction, totalCount ] = await Promise.all([ // Promise.all() - When you have multiple asynchronous operations that you want to run at the same time.
        transactionModel.find(filterConditions)
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt : -1 }), // 1 - Ascending, -1 - Descending, It will Sort the transaction in Descebding Order that means the Newest First.
        transactionModel.countDocuments(filterConditions)
    ])

    const totalPages = Math.ceil( totalCount / pageSize )

    return {
        transaction,
        pagination:{
            pageSize,
            pageNumber,
            totalCount,
            totalPages,
            skip,
        }
    }
}

export const getTransactionByIdService = async(userId : string, transactionId : string ) =>{

    const transaction = await transactionModel.findOne({
        _id : transactionId,
        userId
    })

    if( !transaction ) throw new NotFoundException("Transaction Not Found.")

    return transaction
}

export const duplicateTransactionService = async( userId : string, transactionId : string ) =>{

    const transaction = await transactionModel.findOne({
        _id : transactionId,
        userId
    })
    
    if( !transaction ) throw new NotFoundException("Transaction Not Found")

    const duplicated = await transactionModel.create({
        ...transaction.toObject(),
        _id: undefined,
        title: `Duplicate - ${transaction.title}`,
        description: transaction.description ? `${transaction.description} (Duplicate)` : "Duplicated Transaction",
        isRecurring : false,
        recurringInterval : undefined,
        nextRecurringDate : undefined,
        createdAt : undefined,
        updatedAt : undefined
    })

    return duplicated
}

export const updateTransactionService = async( userId : string, transactionId : string, body : UpdateTransactionType ) =>{

    const exsistingTransaction = await transactionModel.findOne({

        _id : transactionId,
        userId,
    })

    if( !exsistingTransaction ) throw new NotFoundException("Transaction Not Found")

    const now = new Date()

    const isRecurring = body.isRecurring ??
    exsistingTransaction.isRecurring

    const date = body.date !== undefined ? new Date( body.date ) : exsistingTransaction.date

    const recurringInterval = body.recurringInterval || exsistingTransaction.recurringInterval

    let nextRecurringDate : Date | undefined

    if( isRecurring && recurringInterval ){

        const calculateDate = calculateNextOccurrence(date, recurringInterval)

        nextRecurringDate = calculateDate < now ?
        calculateNextOccurrence(now, recurringInterval) : calculateDate
    }

    exsistingTransaction.set({
        ...(body.title && {title : body.title }),
        ...(body.description && { description : body.description }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.paymentMethod && { paymentMethod : body.paymentMethod }),
        ...(body.amount !== undefined && { amount : Number(body.amount) }),
        date,
        isRecurring,
        recurringInterval,
        nextRecurringDate,
    })

    await exsistingTransaction.save()

    return
}

export const deleteTransactionService = async( userId : string, transactionId : string ) =>{

    const deleted = await transactionModel.findByIdAndDelete({
        _id : transactionId,
        userId
    })

    if( !deleted ) throw new NotFoundException("Transaction Not Found.")

    return
}

export const bulkDeleteTransactionService = async( userId : string, transactionIds : string[] ) =>{

    const result = await transactionModel.deleteMany({
        _id : { $in : transactionIds },
        userId
    })

    if( result.deletedCount === 0 ) throw new NotFoundException("No Transaction Found.")

    return{

        success : true,
        deletCount : result.deletedCount
    }
}

export const bulkTransactionService = async( userId : string, transactions : createTransactionType[] ) =>{

    try{
        const bulkOps = transactions.map((tx) => ({
            insertOne : {
                document : {
                    ...tx,
                    userId,
                    isRecurring : false,
                    nextRecurringDate : null,
                    recurringInterval : null,
                    lastProcessed : null,
                    createdAt : new Date(),
                    updatedAt : new Date(),
                },
            },
        }))

        const result = await transactionModel.bulkWrite(bulkOps, {

            ordered : true,
        })

        return{
            insertedCount : result.insertedCount,
            success : true,
        }
    }
    catch(error){

        throw error
    }
}

export const receiptScanService = async(file : Express.Multer.File | undefined ) =>{

    if( !file ) throw new BadRequestException("No File Uploaded")

    try{
        if(!file.path){
            throw new BadRequestException("Failed to Upload File.")
        }

        console.log(file.path)
        const responseData = await axios.get(file?.path, {
            responseType : 'arraybuffer'
        })

        const fileBuffer = Buffer.from(responseData.data);
        const base64String = fileBuffer.toString("base64");

        if( !base64String ) throw new BadRequestException("Could not Process File.")

        const result = await genAI.models.generateContent({
            model:genAIModel,
            contents:[
                createUserContent([
                    receiptPrompt,
                    createPartFromBase64( base64String, file.mimetype )
                ]),
            ],      
            config: { 
                temperature:0,
                topP : 1, 
                responseMimeType : "application/json"
            },
        })

        const response = result.text
        const cleanedText = response?.replace(/```(?:json)?\n?/g,"").trim()

        if(!cleanedText) return{ error : "Could not read Receipt Content" }

        const data = JSON.parse(cleanedText)

        if( !data?.amount || !data.date ){
            return{ error : "Receipt Missing required Information"}
        }

        return{
            title: data.title || "Receipt",
            amount: data.amount,
            date: data.date,
            description: data.description,
            category: data.category,
            paymentMethod: data.paymentMethod,
            type: data.type,
            receiptUrl: file.path,
        }
    }
    catch(error){

        console.error("Receipt scanning error:", error)
        
        return { error : "Receipt Scanning Service Unavilable."}
    }
}