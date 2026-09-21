import mongoose from "mongoose"
import transactionModel from "../../models/transaction.model.js"
import { calculateNextOccurrence } from "../../utils/helper.js"

export const processRecurringTransactions = async() =>{

    const now = new Date()

    let processedCount = 0
    let failedCount = 0

    try{
        const transactionCursor =  transactionModel.find({
            isRecurring : true,
            nextRecurringDate : {$lte:now},
        }).cursor()

        console.log("Stratimg Recurring Process.")

        for await ( const tx of transactionCursor ){
            const nextDate = calculateNextOccurrence(
                tx.nextRecurringDate!,
                tx.recurringInterval!
            )

            const session = await mongoose.startSession()

            try{
                await session.withTransaction( async() =>{
                    await transactionModel.create([{
                        ...tx.toObject(),
                        _id: new mongoose.Types.ObjectId(),
                        title: `Recurring - ${tx.title}`,
                        date: tx.nextRecurringDate,
                        isRecurring: false,
                        nextRecurringDate: null,
                        recurringInterval: null,
                        lastProcessed: null,
                        createdAt: undefined,
                        updatedAt: undefined,
                    },
                    ],
                    {session}
                )

                    await transactionModel.updateOne(
                        { _id:tx._id },
                        {
                            $set: {
                                nextRecurringDate : nextDate,
                                lastProcessed: now
                            },
                        },
                        {session},
                    )
                },
                {
                    maxCommitTimeMS : 20000,
                }
            )

            processedCount++
            }
            catch(error : any ){
                failedCount++
                console.log(`Failed Recurring tx: ${tx._id}`,
                    error
                )
            }
            finally{
                await session.endSession()
            }
        }
        
        console.log(`Processed : ${processedCount} transaction`)
        console.log(`Failed : ${failedCount} transaction`)
        
        return{
            success : true,
            processedCount,
            failedCount
        }
    }
    catch(error: unknown){
        console.error("Error Occur Processing Transaction.", error)

        return{
            success: true,
            error: error instanceof Error ? error.message : String(error)
        }
    }
}