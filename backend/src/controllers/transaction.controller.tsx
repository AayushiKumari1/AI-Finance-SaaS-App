import type { Request, Response } from "express"
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js"
import { HTTPSTATUS } from "../config/http.config.js"
import { transactionIdSchema , createTransactionSchema, updateTransactionSchema, bulkDeleteTransactionSchema, bulkTransactionSchema } from "../validators/transaction.validator.js"
import { bulkDeleteTransactionService, bulkTransactionService, createTransactionService, deleteTransactionService, duplicateTransactionService, getAllTransactionService, getTransactionByIdService, receiptScanService, updateTransactionService } from "../services/transaction.service.js"
import type { TransactionTypeEnum } from "../models/transaction.model.js"

export const createTransactionController = asyncHandler( async ( req : Request, res : Response ) =>{

    const body = createTransactionSchema.parse(req.body)
    const userId = req.user?._id
    
    const transactions = await createTransactionService(body, userId)
    
    return res.status(HTTPSTATUS.CREATED).json({
        message : "Trasaction Created Successfully.",
        transactions,
    })
})

export const getAllTransactionController = asyncHandler( 
    
    async ( req : Request, res : Response ) =>{

        const userId = req.user?._id

        const keyword = req.query.keyword as string | undefined
        const type = req.query.type as keyof typeof TransactionTypeEnum | undefined
        const recurringStatus = req.query.recurringStatus as
            | "RECURRING"
            | "NON_RECURRING"
            | undefined

        const filters = {
            ...(keyword !== undefined && { keyword }),
            ...(type !== undefined && { type }),
            ...(recurringStatus !== undefined && { recurringStatus }),
        }

        const pagination = {
            pageSize : parseInt(req.query.pageSize as string) || 20,
            pageNumber : parseInt( req.query.pageNumber as string ) || 1,
        }
            
        const result = await getAllTransactionService( userId, filters, pagination )
            
        return res.status(HTTPSTATUS.OK).json({
            "message" : "Transaction fetched Successfully.",
            ...result,
        })
    }
)

export const getTransactionByIdController = asyncHandler( 
    
    async ( req : Request, res : Response ) =>{

        const userId = req.user?._id

        const transactionId = transactionIdSchema.parse(req.params.id)

        const transaction = await getTransactionByIdService(userId, transactionId )

        return res.status(HTTPSTATUS.OK).json({
            message : "Transaction fetched Successfully",
            transaction
        })
    }
)

export const duplicateTransactionController = asyncHandler( 
    
    async ( req : Request, res : Response ) =>{

        const userId = req.user?._id

        const transactionId = transactionIdSchema.parse(req.params.id)

        const transaction = await duplicateTransactionService(userId, transactionId)

        return res.status(HTTPSTATUS.OK).json({
            message : "Transaction duplicated Successfully",
            data : transaction
        })
    }
)

export const updateTransactionController = asyncHandler( 
    
    async ( req : Request, res : Response ) =>{

        const userId = req.user?._id

        const transactionId = transactionIdSchema.parse(req.params.id)

        const body = updateTransactionSchema.parse(req.body)

        const updatedTransaction = await updateTransactionService(userId, transactionId, body)

        return res.status(HTTPSTATUS.OK).json({
            message : "Transaction Updated Successfully",
            transactions : updatedTransaction,
        })
    }
)

export const deleteTransactionController = asyncHandler( 
    
    async ( req : Request, res : Response ) =>{

        const userId = req.user?._id

        const transactionId = transactionIdSchema.parse(req.params.id)

        await deleteTransactionService(userId, transactionId)

        return res.status(HTTPSTATUS.OK).json({
            message : "Transaction Deleted Successfully"
        })
    }
)

export const bulkDeleteTransactionController = asyncHandler( 
    
    async ( req : Request, res : Response ) =>{

        const userId = req.user?._id

        const { transactionIds } = bulkDeleteTransactionSchema.parse(req.body)

        const result = await bulkDeleteTransactionService(userId, transactionIds )

        return res.status(HTTPSTATUS.OK).json({
            message : "Transaction Deleted Successfully",
            ...result,
        })
    }
)

export const bulkTransactionController = asyncHandler( 
    
    async ( req : Request, res : Response ) =>{

        const userId = req.user?._id
        const {transactions} = bulkTransactionSchema.parse(req.body)

        const result = await bulkTransactionService(userId, transactions)
        
        return res.status(HTTPSTATUS.OK).json({
            message : "Bulk Transaction Inserted Successfully",
            ...result
        })
    }
)

export const scanReceiptController = asyncHandler( 
    
    async ( req : Request, res : Response ) =>{

        const file = req?.file
        
        const result = await receiptScanService(file)
        
        return res.status(HTTPSTATUS.OK).json({
            message: "Receipt Scanned Successfully",
            data: result,
        })
    }
)