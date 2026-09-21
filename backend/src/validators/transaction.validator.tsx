import { z } from 'zod'
import { PaymentMethodEnum, RecurringIntervalEnum, TransactionTypeEnum } from '../models/transaction.model.js'

export const transactionIdSchema = z.string().trim().min(1);

export const baseTransactionSchema = z.object({

    title : z.string().min(1,"Title is Required."),
    description : z.string().optional(),
    type: z.enum([ TransactionTypeEnum.INCOME, TransactionTypeEnum.EXPENSE ], {
        errorMap : ()=>({
            message : "Transaction type must be either INCOME or EXPENSE"
        }),
    }),
    amount : z.number().positive("Amount must be Positive.").min(1),
    category : z.string().min(1, "Category is Required."),
    date : z.union([z.string().datetime({ message: " Invalid Date String" }), z.date()])
    .transform((val: string | Date)=> new Date(val) ),
    isRecurring : z.boolean().default(false),
    recurringInterval : z.enum([
        RecurringIntervalEnum.DAILY,
        RecurringIntervalEnum.WEEKLY,
        RecurringIntervalEnum.MONTHLY,
        RecurringIntervalEnum.YEARLY,
    ]).nullable().optional(),
    receiptUrl : z.string().optional(),
    paymentMethod : z.enum([
        PaymentMethodEnum.CARD,
        PaymentMethodEnum.BANK_TRANSFER,
        PaymentMethodEnum.MOBLIE_PAYMENT,
        PaymentMethodEnum.AUTO_DEBIT,
        PaymentMethodEnum.CASH,
        PaymentMethodEnum.OTHER,
    ]).default(PaymentMethodEnum.CASH)
})

export const bulkDeleteTransactionSchema = z.object({
    
    transactionIds : z.array(z.string().length(24, "Invalid Transaction ID Fromat"))
    .min(1,"At least one transaction ID must be provided.")
})

export const bulkTransactionSchema = z.object({

    transactions : z.array(baseTransactionSchema)
    .min(1,"At least one transaction is required.")
    .max(300,"Must not be more than 300 Transactions.")
    .refine((txs) =>
        
        txs.every((tx) =>{
            const amount = Number(tx.amount)
            return !isNaN(amount) && amount > 0 && amount <= 1_000_000_000
        }),
        {
            message : "Amount must be Positive Number.",
        }
    ),
})

export const createTransactionSchema = baseTransactionSchema
export const updateTransactionSchema = baseTransactionSchema.partial()

export type createTransactionType = z.infer<typeof createTransactionSchema>

export type UpdateTransactionType = z.infer<typeof updateTransactionSchema>

export type bulkDeleteTransactionType = z.infer<typeof bulkDeleteTransactionSchema>

