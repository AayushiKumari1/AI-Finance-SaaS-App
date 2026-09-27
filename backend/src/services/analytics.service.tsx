import mongoose, { type PipelineStage } from "mongoose"
import type { Request, Response } from "express"
import { DateRangeEnum, type DateRangePreset } from "../enums/date_range.enum.js"
import transactionModel, { TransactionTypeEnum } from "../models/transaction.model.js"
import { getDateRange } from "../utils/date.js"
import { differenceInDays, subDays, subYears } from "date-fns"
import { convertToDollarUnit } from "../utils/format_currency.js"

// export const summaryAnalyticsService = async( 
//     userId: string, 
//     dateRangePreset : DateRangePreset, 
//     customFrom?: Date, 
//     customTo?: Date
// )=>{
//     const range = getDateRange(dateRangePreset, customFrom, customTo)

//     const { from, to, value : rangeValue } = range

//     const currentPeriodPipeline : any[] = [
//         {
//             $match: {
//                 userId : new mongoose.Types.ObjectId(userId),
//                 ...(from && to && {
//                     date : {
//                         $gte: from,
//                         $lte: to,
//                     },
//                 }),
//             },
//         },

//         {
//             $group: {
//                 _id: null,
//                 totalIncome : {
//                     $sum : {
//                         $cond : [
//                             { $eq: ["$type", TransactionTypeEnum.INCOME ]},
//                             {  $abs: {
//                                 $convert: {
//                                     input: "$amount",
//                                     to: "double",
//                                     onError: 0,
//                                     onNull: 0,
//                                 },
//                             }, },
//                             0,
//                         ],
//                     },
//                 },

//                 totalExpenses : {
//                     $sum : {
//                         $cond : [
//                             { $eq: ["$type", TransactionTypeEnum.EXPENSE ]},
//                             {
//                                 $abs: {
//                                     $convert: {
//                                         input: "$amount",
//                                         to: "double",
//                                         onError: 0,
//                                         onNull: 0,
//                                     },
//                                 },
//                             },
//                             0,
//                         ],
//                     },
//                 },

//                 transactionCount : { $sum: 1 },
//             },
//         },

//         {
//             $project: {
//                 _id : 0,
//                 totalIncome: 1,
//                 totalExpenses: 1,
//                 transactionCount: 1,
//                 availableBalance: { $subtract : [
//                     {
//                     $convert: {
//                         input: "$totalIncome",
//                         to: "double",
//                         onError: 0,
//                         onNull: 0
//                     }
//                 },
//                 {
//                     $convert: {
//                         input: "$totalExpenses",
//                         to: "double",
//                         onError: 0,
//                         onNull: 0
//                     }
//                 }
//                 ] },
//                 // savingsData : {
//                 //     $let: {
//                 //         vars:{
//                 //             income : { $ifNull : ["totalIncome", 0]},
//                 //             expenses : { $ifNull : ["totalExpenses", 0]},
//                 //         },

//                 //         in: {
//                 //             savingsPercentage : {
//                 //                 $cond:[
//                 //                     {$lte: ["$$income", 0]},
//                 //                     0,
//                 //                     {
//                 //                         $multiply: [
//                 //                             {
//                 //                                 $divide: [
//                 //                                     {
//                 //                                         $subtract : [
//                 //                                             {
//                 //                                                 $convert: {
//                 //                                                     input: "$totalIncome",
//                 //                                                     to: "double",
//                 //                                                     onError: 0,
//                 //                                                     onNull: 0
//                 //                                                 }
//                 //                                             },
//                 //                                             {
//                 //                                                 $convert: {
//                 //                                                     input: "$totalExpenses",
//                 //                                                     to: "double",
//                 //                                                     onError: 0,
//                 //                                                     onNull: 0
//                 //                                                 }
//                 //                                             }
//                 //                                         ]
//                 //                                     },
//                 //                                     "$$income",
//                 //                                 ],
//                 //                             },
//                 //                             100,
//                 //                         ],
//                 //                     },
//                 //                 ],
//                 //             },

//                 //             expenseRatio: {

//                 //             $cond: [
//                 //                 {$lte: ["$$income", 0]},
//                 //                 0,
//                 //                 {
//                 //                     $multiply : [ {
//                 //                         $divide: ["$$expenses", "$$income"],
//                 //                     }, 100 ],       
//                 //                 },
//                 //             ],
//                 //         },
//                 //         },
//                 //     },
//                 // },
//                 savingsData: {
//             $let: {
//                 vars: {
//                     income: {
//                         $convert: {
//                             input: "$totalIncome",
//                             to: "double",
//                             onError: 0,
//                             onNull: 0
//                         }
//                     },

//                     expenses: {
//                         $convert: {
//                             input: "$totalExpenses",
//                             to: "double",
//                             onError: 0,
//                             onNull: 0
//                         }
//                     }
//                 },

//                 in: {
//                     savingsPercentage: {
//                         $cond: [
//                             { $lte: ["$$income", 0] },
//                             0,
//                             {
//                                 $multiply: [
//                                     {
//                                         $divide: [
//                                             {
//                                                 $subtract: [
//                                                     "$$income",
//                                                     "$$expenses"
//                                                 ]
//                                             },
//                                             "$$income"
//                                         ]
//                                     },
//                                     100
//                                 ]
//                             }
//                         ]
//                     },

//             expenseRatio: {
//                 $cond: [
//                     { $lte: ["$$income", 0] },
//                     0,
//                     {
//                         $multiply: [
//                             {
//                                 $divide: [
//                                     "$$expenses",
//                                     "$$income"
//                                 ]
//                             },
//                             100
//                         ]
//                     }
//                 ]
//             }
//         }
//     }
// },
//             },
//         },
//     ]

//     const [ current ] = await transactionModel.aggregate( currentPeriodPipeline )

//     const {
//         totalIncome = 0,
//         totalExpenses = 0,
//         availableBalance = 0,
//         savingsData = {
//             expenseRatio : 0,
//             savingsPercentage : 0,
//         },
//         transactionCount = 0,
//     } = current || { }

//     console.log(current, "current")

//     let percentageChange : any = {
//         income : 0,
//         expenses: 0,
//         balance: 0,
//         prevPeriodFrom : null,
//         prevPeriodTo : null,
//         previousValues :  {

//             incomeAmount : 0,
//             expenseAmount : 0,
//             balanceAmount : 0,
//         }
//     }

//     if( from && to && rangeValue !== DateRangeEnum.ALL_TIME ){

//         const period = differenceInDays( to, from ) + 1 // It will always give us 29 , which is not correct according to the Calender, so we will add 1 to it.

//         console.log(`${differenceInDays( to, from )}`, period, "Period")

//         const isYearly = [
//             DateRangeEnum.LAST_YEAR,
//             DateRangeEnum.THIS_YEAR,
//         ].includes(rangeValue)

//         const prevPeriodFrom = isYearly ? subYears(from, 1) : subDays(from, period)

//         const prevPeriodTo = isYearly ? subYears(to, 1) : subDays(to, period)

//         const prevPeriodPipeline = [
//             {
//                 $match: {
//                     userId : new  mongoose.Types.ObjectId(userId),

//                     date: {
//                         $gte: prevPeriodFrom,
//                         $lte: prevPeriodTo,
//                     },
//                 },
//             },

//             {
//                 $group: {
//                     _id: null,

//                     totalIncome: {
//                         $sum: {
//                             $cond: [
//                                 { $eq: ["$type", TransactionTypeEnum.INCOME] },
//                                 {
//                                     $abs: {
//                                         $convert: {
//                                             input: "$amount",
//                                             to: "double",
//                                             onError: 0,
//                                             onNull: 0
//                                         }
//                                     }
//                                 },
//                                 0
//                             ]
//                         }
//                     },

//                     totalExpenses: {
//                         $sum: {
//                             $cond: [
//                                 { $eq: ["$type", TransactionTypeEnum.EXPENSE] },
//                                 {
//                                     $abs: {
//                                         $convert: {
//                                             input: "$amount",
//                                             to: "double",
//                                             onError: 0,
//                                             onNull: 0
//                                         }
//                                     }
//                                 },
//                                 0
//                             ]
//                         }
//                     }

//                 },
//             }
//         ]

//         const [ previous ] = await transactionModel.aggregate( prevPeriodPipeline )

//         console.log(previous, "Previous Date")

//         if( previous) {
            
//             const prevIncome = previous.totalIncome || 0
//             const prevExpenses = previous.totalExpenses || 0
//             const prevBalance = prevIncome - prevExpenses

//             const currentIncome = totalIncome
//             const currentExpenses = totalExpenses
//             const currentBalance = availableBalance

//             percentageChange = {
//                 income : calculatePercentageChange( prevIncome, currentIncome ),
//                 expenses : calculatePercentageChange(prevExpenses, currentExpenses),
//                 balance: calculatePercentageChange(prevBalance, currentBalance),

//                 prevPeriodFrom,
//                 prevPeriodTo,
//             }
//         }
//     }

//     return {
//         availableBalance : convertToDollarUnit( availableBalance ),
//         totalIncome : convertToDollarUnit(totalIncome),
//         totalExpenses: convertToDollarUnit(totalExpenses),
//         savingsRate: {
//             percentage: parseFloat(savingsData.savingsPercentage.toFixed(2)),
//             expenseRatio : parseFloat(savingsData.expenseRatio),
//         },
//         transactionCount,

//         percentageChange: {
//             ...percentageChange,
//             previousValues: {
//                 incomeAmount : convertToDollarUnit(percentageChange.previousValues.incomeAmount),
//                 expenseAmount : convertToDollarUnit(percentageChange.previousValues.expenseAmount),
//                 balanceAmount : convertToDollarUnit(percentageChange.previousValues.balanceAmount),
//             },
//         },

//         preset: {
//             ...range,
//             value: rangeValue || DateRangeEnum.ALL_TIME,
//             label : range?.label || "All Time",
//         }
//     }
// }

// export const summaryAnalyticsService = async (
//     userId: string,
//     dateRangePreset: DateRangePreset,
//     customFrom?: Date,
//     customTo?: Date
// ) => {

//     const range = getDateRange(
//         dateRangePreset,
//         customFrom,
//         customTo
//     )

//     const {
//         from,
//         to,
//         value: rangeValue
//     } = range

//     const currentPeriodPipeline: any[] = [
//         {
//             $match: {
//                 userId: new mongoose.Types.ObjectId(userId),

//                 ...(from && to && {
//                     date: {
//                         $gte: from,
//                         $lte: to,
//                     },
//                 }),
//             },
//         },

//         {
//             $group: {
//                 _id: null,

//                 totalIncome: {
//                     $sum: {
//                         $cond: [
//                             {
//                                 $eq: [
//                                     "$type",
//                                     TransactionTypeEnum.INCOME
//                                 ]
//                             },
//                             {
//                                 $abs: {
//                                     $convert: {
//                                         input: "$amount",
//                                         to: "double",
//                                         onError: 0,
//                                         onNull: 0
//                                     }
//                                 }
//                             },
//                             0
//                         ]
//                     }
//                 },

//                 totalExpenses: {
//                     $sum: {
//                         $cond: [
//                             {
//                                 $eq: [
//                                     "$type",
//                                     TransactionTypeEnum.EXPENSE
//                                 ]
//                             },
//                             {
//                                 $abs: {
//                                     $convert: {
//                                         input: "$amount",
//                                         to: "double",
//                                         onError: 0,
//                                         onNull: 0
//                                     }
//                                 }
//                             },
//                             0
//                         ]
//                     }
//                 },

//                 transactionCount: {
//                     $sum: 1
//                 },
//             },
//         },

//         {
//             $project: {
//                 _id: 0,

//                 totalIncome: 1,

//                 totalExpenses: 1,

//                 transactionCount: 1,

//                 availableBalance: {
//                     $subtract: [
//                         {
//                             $convert: {
//                                 input: "$totalIncome",
//                                 to: "double",
//                                 onError: 0,
//                                 onNull: 0
//                             }
//                         },
//                         {
//                             $convert: {
//                                 input: "$totalExpenses",
//                                 to: "double",
//                                 onError: 0,
//                                 onNull: 0
//                             }
//                         }
//                     ]
//                 },

//                 savingsData: {
//                     $let: {
//                         vars: {
//                             income: {
//                                 $convert: {
//                                     input: "$totalIncome",
//                                     to: "double",
//                                     onError: 0,
//                                     onNull: 0
//                                 }
//                             },

//                             expenses: {
//                                 $convert: {
//                                     input: "$totalExpenses",
//                                     to: "double",
//                                     onError: 0,
//                                     onNull: 0
//                                 }
//                             }
//                         },

//                         in: {
//                             savingsPercentage: {
//                                 $cond: [
//                                     {
//                                         $lte: [
//                                             "$$income",
//                                             0
//                                         ]
//                                     },
//                                     0,
//                                     {
//                                         $multiply: [
//                                             {
//                                                 $divide: [
//                                                     {
//                                                         $subtract: [
//                                                             "$$income",
//                                                             "$$expenses"
//                                                         ]
//                                                     },
//                                                     "$$income"
//                                                 ]
//                                             },
//                                             100
//                                         ]
//                                     }
//                                 ]
//                             },

//                             expenseRatio: {
//                                 $cond: [
//                                     {
//                                         $lte: [
//                                             "$$income",
//                                             0
//                                         ]
//                                     },
//                                     0,
//                                     {
//                                         $multiply: [
//                                             {
//                                                 $divide: [
//                                                     "$$expenses",
//                                                     "$$income"
//                                                 ]
//                                             },
//                                             100
//                                         ]
//                                     }
//                                 ]
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     ]

//     const [current] =
//         await transactionModel.aggregate(
//             currentPeriodPipeline
//         )

//     const {
//         totalIncome = 0,
//         totalExpenses = 0,
//         availableBalance = 0,

//         savingsData = {
//             expenseRatio: 0,
//             savingsPercentage: 0,
//         },

//         transactionCount = 0,

//     } = current || {}

//     console.log(current, "current")


//     // -----------------------------------------
//     // Percentage Change
//     // -----------------------------------------

//     let percentageChange: any = {
//         income: 0,
//         expenses: 0,
//         balance: 0,

//         prevPeriodFrom: null,
//         prevPeriodTo: null,
//     }


//     // -----------------------------------------
//     // Previous Period Values
//     // -----------------------------------------

//     let previousValues = {
//         incomeAmount: 0,
//         expenseAmount: 0,
//         balanceAmount: 0,
//     }


//     // -----------------------------------------
//     // Calculate Previous Period
//     // -----------------------------------------

//     if (
//         from &&
//         to &&
//         rangeValue !== DateRangeEnum.ALL_TIME
//     ) {

//         const period =
//             differenceInDays(to, from) + 1

//         console.log(
//             differenceInDays(to, from),
//             period,
//             "Period"
//         )


//         const isYearly = [
//             DateRangeEnum.LAST_YEAR,
//             DateRangeEnum.THIS_YEAR,
//         ].includes(rangeValue)


//         // Previous period start
//         const prevPeriodFrom = isYearly
//             ? subYears(from, 1)
//             : subDays(from, period)


//         // Previous period end
//         const prevPeriodTo = isYearly
//             ? subYears(to, 1)
//             : subDays(to, period)


//         console.log(
//             {
//                 from,
//                 to,
//                 prevPeriodFrom,
//                 prevPeriodTo
//             },
//             "Date Periods"
//         )


//         const prevPeriodPipeline = [

//             {
//                 $match: {

//                     userId:
//                         new mongoose.Types.ObjectId(userId),

//                     date: {
//                         $gte: prevPeriodFrom,
//                         $lte: prevPeriodTo,
//                     },
//                 },
//             },

//             {
//                 $group: {

//                     _id: null,


//                     // Previous Income
//                     totalIncome: {

//                         $sum: {

//                             $cond: [

//                                 {
//                                     $eq: [
//                                         "$type",
//                                         TransactionTypeEnum.INCOME
//                                     ]
//                                 },

//                                 {
//                                     $abs: {

//                                         $convert: {

//                                             input: "$amount",

//                                             to: "double",

//                                             onError: 0,

//                                             onNull: 0
//                                         }
//                                     }
//                                 },

//                                 0
//                             ]
//                         }
//                     },


//                     // Previous Expenses
//                     totalExpenses: {

//                         $sum: {

//                             $cond: [

//                                 {
//                                     $eq: [
//                                         "$type",
//                                         TransactionTypeEnum.EXPENSE
//                                     ]
//                                 },

//                                 {
//                                     $abs: {

//                                         $convert: {

//                                             input: "$amount",

//                                             to: "double",

//                                             onError: 0,

//                                             onNull: 0
//                                         }
//                                     }
//                                 },

//                                 0
//                             ]
//                         }
//                     }
//                 }
//             }
//         ]


//         const [previous] =
//             await transactionModel.aggregate(
//                 prevPeriodPipeline
//             )


//         console.log(
//             previous,
//             "Previous Date"
//         )


//         // -----------------------------------------
//         // Calculate Changes
//         // -----------------------------------------

//         if (previous) {

//             const prevIncome =
//                 previous.totalIncome || 0

//             const prevExpenses =
//                 previous.totalExpenses || 0

//             const prevBalance =
//                 prevIncome - prevExpenses


//             const currentIncome =
//                 totalIncome

//             const currentExpenses =
//                 totalExpenses

//             const currentBalance =
//                 availableBalance


//             // Percentage Changes
//             percentageChange = {

//                 income:
//                     calculatePercentageChange(
//                         prevIncome,
//                         currentIncome
//                     ),

//                 expenses:
//                     calculatePercentageChange(
//                         prevExpenses,
//                         currentExpenses
//                     ),

//                 balance:
//                     calculatePercentageChange(
//                         prevBalance,
//                         currentBalance
//                     ),

//                 prevPeriodFrom,

//                 prevPeriodTo,
//             }


//             // IMPORTANT:
//             // Store actual previous amounts here
//             previousValues = {

//                 incomeAmount:
//                     prevIncome,

//                 expenseAmount:
//                     prevExpenses,

//                 balanceAmount:
//                     prevBalance,
//             }
//         }
//     }


//     // -----------------------------------------
//     // Final Response
//     // -----------------------------------------

//     return {

//         availableBalance:
//             convertToDollarUnit(
//                 availableBalance
//             ),


//         totalIncome:
//             convertToDollarUnit(
//                 totalIncome
//             ),


//         totalExpenses:
//             convertToDollarUnit(
//                 totalExpenses
//             ),


//         savingsRate: {

//             percentage:
//                 parseFloat(
//                     savingsData.savingsPercentage
//                         .toFixed(2)
//                 ),

//             expenseRatio:
//                 parseFloat(
//                     savingsData.expenseRatio
//                 ),
//         },


//         transactionCount,


//         percentageChange: {

//             ...percentageChange,

//             previousValues: {

//                 incomeAmount:
//                     convertToDollarUnit(
//                         previousValues.incomeAmount
//                     ),

//                 expenseAmount:
//                     convertToDollarUnit(
//                         previousValues.expenseAmount
//                     ),

//                 balanceAmount:
//                     convertToDollarUnit(
//                         previousValues.balanceAmount
//                     ),
//             },
//         },


//         preset: {

//             ...range,

//             value:
//                 rangeValue ||
//                 DateRangeEnum.ALL_TIME,

//             label:
//                 range?.label ||
//                 "All Time",
//         }
//     }
// }

export const summaryAnalyticsService = async (
    userId: string,
    dateRangePreset: DateRangePreset,
    customFrom?: Date,
    customTo?: Date
) => {
    // ---------------------------------------------------------
    // 1. GET CURRENT DATE RANGE
    // ---------------------------------------------------------
    const range = getDateRange(
        dateRangePreset,
        customFrom,
        customTo
    );

    const {
        from,
        to,
        value: rangeValue
    } = range;


    // ---------------------------------------------------------
    // 2. CURRENT PERIOD PIPELINE
    // ---------------------------------------------------------
    const currentPeriodPipeline: any[] = [
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),

                ...(from && to
                    ? {
                          date: {
                              $gte: from,
                              $lte: to,
                          },
                      }
                    : {}),
            },
        },

        {
            $group: {
                _id: null,

                totalIncome: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    "$type",
                                    TransactionTypeEnum.INCOME,
                                ],
                            },
                            {
                                $abs: {
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

                totalExpenses: {
                    $sum: {
                        $cond: [
                            {
                                $eq: [
                                    "$type",
                                    TransactionTypeEnum.EXPENSE,
                                ],
                            },
                            {
                                $abs: {
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

                transactionCount: {
                    $sum: 1,
                },
            },
        },

        {
            $project: {
                _id: 0,

                totalIncome: 1,
                totalExpenses: 1,
                transactionCount: 1,

                // ---------------------------------------------
                // BALANCE
                // ---------------------------------------------
                availableBalance: {
                    $subtract: [
                        "$totalIncome",
                        "$totalExpenses",
                    ],
                },

                // ---------------------------------------------
                // SAVINGS RATE
                // ---------------------------------------------
                savingsData: {
                    $let: {
                        vars: {
                            income: {
                                $convert: {
                                    input: "$totalIncome",
                                    to: "double",
                                    onError: 0,
                                    onNull: 0,
                                },
                            },

                            expenses: {
                                $convert: {
                                    input: "$totalExpenses",
                                    to: "double",
                                    onError: 0,
                                    onNull: 0,
                                },
                            },
                        },

                        in: {
                            // Savings %
                            savingsPercentage: {
                                $cond: [
                                    {
                                        $lte: [
                                            "$$income",
                                            0,
                                        ],
                                    },
                                    0,

                                    {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    {
                                                        $subtract: [
                                                            "$$income",
                                                            "$$expenses",
                                                        ],
                                                    },
                                                    "$$income",
                                                ],
                                            },
                                            100,
                                        ],
                                    },
                                ],
                            },

                            // Expense %
                            expenseRatio: {
                                $cond: [
                                    {
                                        $lte: [
                                            "$$income",
                                            0,
                                        ],
                                    },
                                    0,

                                    {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    "$$expenses",
                                                    "$$income",
                                                ],
                                            },
                                            100,
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
            },
        },
    ];


    // ---------------------------------------------------------
    // 3. RUN CURRENT PERIOD
    // ---------------------------------------------------------
    const [current] =
        await transactionModel.aggregate(
            currentPeriodPipeline
        );

    console.log(
        "========== CURRENT PERIOD =========="
    );

    console.log("Preset:", rangeValue);
    console.log("From:", from);
    console.log("To:", to);
    console.log("Current:", current);

    console.log(
        "====================================="
    );


    // ---------------------------------------------------------
    // 4. SAFE DEFAULT VALUES
    // ---------------------------------------------------------
    const totalIncome =
        Number(current?.totalIncome ?? 0);

    const totalExpenses =
        Number(current?.totalExpenses ?? 0);

    const availableBalance =
        Number(current?.availableBalance ?? 0);

    const transactionCount =
        Number(current?.transactionCount ?? 0);


    // ---------------------------------------------------------
    // 5. CALCULATE SAVINGS IN JAVASCRIPT
    //
    // This is safer than depending on MongoDB's nested
    // savingsData when there are no transactions.
    // ---------------------------------------------------------
    const savingsPercentage =
        totalIncome > 0
            ? ((totalIncome - totalExpenses) /
                  totalIncome) *
              100
            : 0;

    const expenseRatio =
        totalIncome > 0
            ? (totalExpenses / totalIncome) *
              100
            : 0;


    console.log(
        "Savings Percentage:",
        savingsPercentage
    );

    console.log(
        "Expense Ratio:",
        expenseRatio
    );


    // ---------------------------------------------------------
    // 6. PERCENTAGE CHANGE
    // ---------------------------------------------------------
    let percentageChange = {
        income: 0,
        expenses: 0,
        balance: 0,
        prevPeriodFrom: null as Date | null,
        prevPeriodTo: null as Date | null,
    };


    // IMPORTANT:
    // Keep previous values separately.
    let previousValues = {
        incomeAmount: 0,
        expenseAmount: 0,
        balanceAmount: 0,
    };


    // ---------------------------------------------------------
    // 7. PREVIOUS PERIOD
    // ---------------------------------------------------------
    if (
        from &&
        to &&
        rangeValue !== DateRangeEnum.ALL_TIME
    ) {

        const period =
            differenceInDays(to, from) + 1;

        console.log(
            "Current period days:",
            period
        );


        const isYearly = [
            DateRangeEnum.LAST_YEAR,
            DateRangeEnum.THIS_YEAR,
        ].includes(rangeValue);


        const prevPeriodFrom = isYearly
            ? subYears(from, 1)
            : subDays(from, period);


        const prevPeriodTo = isYearly
            ? subYears(to, 1)
            : subDays(to, period);


        console.log(
            "========== PREVIOUS PERIOD =========="
        );

        console.log(
            "Previous From:",
            prevPeriodFrom
        );

        console.log(
            "Previous To:",
            prevPeriodTo
        );


        // -----------------------------------------------------
        // PREVIOUS PERIOD PIPELINE
        // -----------------------------------------------------
        const prevPeriodPipeline: any[] = [
            {
                $match: {
                    userId:
                        new mongoose.Types.ObjectId(
                            userId
                        ),

                    date: {
                        $gte: prevPeriodFrom,
                        $lte: prevPeriodTo,
                    },
                },
            },

            {
                $group: {
                    _id: null,

                    totalIncome: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$type",
                                        TransactionTypeEnum.INCOME,
                                    ],
                                },

                                {
                                    $abs: {
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

                    totalExpenses: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$type",
                                        TransactionTypeEnum.EXPENSE,
                                    ],
                                },

                                {
                                    $abs: {
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
                },
            },
        ];


        const previousResult =
            await transactionModel.aggregate(
                prevPeriodPipeline
            );


        const previous =
            previousResult[0];


        console.log(
            "Previous Result:",
            previousResult
        );

        console.log(
            "Previous:",
            previous
        );


        // -----------------------------------------------------
        // 8. HANDLE PREVIOUS PERIOD
        // -----------------------------------------------------
        const prevIncome = Number(previous?.totalIncome || 0);

        const prevExpenses = Number(previous?.totalExpenses || 0);

        const prevBalance = prevIncome - prevExpenses;


        // Save previous values
        previousValues = {
            incomeAmount: prevIncome,
            expenseAmount: prevExpenses,
            balanceAmount: prevBalance,
        };


        // -----------------------------------------------------
        // 9. CALCULATE PERCENTAGE CHANGES
        // -----------------------------------------------------
        percentageChange = {

            income: calculatePercentageChange( prevIncome,
                totalIncome ),

            expenses: calculatePercentageChange(
                prevExpenses,
                totalExpenses
            ),

            balance: calculatePercentageChange(
                prevBalance,
                availableBalance
            ),

            prevPeriodFrom,
            prevPeriodTo,
        };


        console.log(
            "Percentage Change:",
            percentageChange
        );

        console.log(
            "======================================"
        );
    }


    // ---------------------------------------------------------
    // 10. RETURN RESPONSE
    // ---------------------------------------------------------
    return {
        availableBalance:
            convertToDollarUnit(
                availableBalance
            ),

        totalIncome:
            convertToDollarUnit(
                totalIncome
            ),

        totalExpenses:
            convertToDollarUnit(
                totalExpenses
            ),

        savingsRate: {
            percentage: Number(
                savingsPercentage.toFixed(2)
            ),

            expenseRatio: Number(
                expenseRatio.toFixed(2)
            ),
        },

        transactionCount,

        percentageChange: {
            ...percentageChange,

            previousValues: {
                incomeAmount:
                    convertToDollarUnit(
                        previousValues.incomeAmount
                    ),

                expenseAmount:
                    convertToDollarUnit(
                        previousValues.expenseAmount
                    ),

                balanceAmount:
                    convertToDollarUnit(
                        previousValues.balanceAmount
                    ),
            },
        },


        preset: {
            ...range,

            value:
                rangeValue ||
                DateRangeEnum.ALL_TIME,

            label:
                range?.label ||
                "All Time",
        },
    };
};

export const chartAnalyticsService = async(
    userId : string,
    dateRangePreset?: DateRangePreset,
    customFrom?: Date,
    customTo?: Date,
) =>{

    const range = getDateRange( dateRangePreset, customFrom, customTo )

    const { from, to, value: rangeValue } = range

    const filter : any = {
        userId: new mongoose.Types.ObjectId(userId),
        ...(from && to && {
            date : {
                $gte: from,
                $lte: to,
            }
        })
    }

    const result = await transactionModel.aggregate([

        { $match : filter },
        {
            $group : {
                _id : {
                    $dateToString : {
                        format : "%Y-%m-%d",
                        date: "$date",
                    },
                },
            
            income: {
                $sum: {
                    $cond: [
                        { $eq: ["$type", TransactionTypeEnum.INCOME] },
                        {
                            $abs: {
                                $convert: {
                                    input: "$amount",
                                    to: "double",
                                    onError: 0,
                                    onNull: 0
                                }
                            }
                        },
                        0
                    ]
                }
            },

            expenses: {
                $sum: {
                    $cond: [
                        { $eq: ["$type", TransactionTypeEnum.EXPENSE] },
                        {
                            $abs: {
                                $convert: {
                                    input: "$amount",
                                    to: "double",
                                    onError: 0,
                                    onNull: 0
                                }
                            }
                        },
                        0
                    ]
                }
            },

            incomeCount : {

                $sum : {
                    $cond : [
                        { $eq : ["$type", TransactionTypeEnum.INCOME] },
                        1,
                        0
                    ],
                },
            },

            expenseCount : {

                $sum : {
                    $cond : [
                        { $eq : ["$type", TransactionTypeEnum.EXPENSE] },
                        1,
                        0
                    ],
                },
            },
            },
        },

        { $sort : { _id : 1 } },

        {
            $project : {
                _id : 0,
                date: "$_id",
                income: 1,
                expenses: 1,
                incomeCount: 1,
                expenseCount: 1,
            },
        },

        {
            $group : {
                _id: null,
                chartData : { $push : "$$ROOT" } ,
                    totalIncomeCount : { $sum : "$incomeCount" },
                    totalExpenseCount : { $sum : "$expenseCount" },
            },
        },

        {
            $project : {
                _id : 0,
                chartData : 1,
                totalIncomeCount : 1,
                totalExpenseCount : 1,
            },
        },
    ])

    const resultData = result[0] || {}

    console.log(result, "Result")

    const transformedData = ( result[0]?.chartData || [] ).map
    ((item : any ) =>({
        date : item.date,
        income : convertToDollarUnit(item.income),
        expenses : convertToDollarUnit(item.expenses),
    }))

    return {
        chartData : transformedData,
        totalIncomeCount : resultData.totalIncomeCount,
        totalExpenseCount : resultData.totalExpenseCount,
        preset: {
            ...range,
            value : rangeValue || DateRangeEnum.ALL_TIME,
            label : range?.label || "All Time",
        },
    }
}

export const expensePieChartBreakdownService = async( userId : string,
    dateRangePreset?: DateRangePreset,
    customFrom ?: Date,
    customTo ?: Date,
) =>{

    const range = getDateRange( dateRangePreset, customFrom, customTo )

    const { from, to, value:rangeValue } = range

    const filter : any = {
        userId: new mongoose.Types.ObjectId(userId),
        type : TransactionTypeEnum.EXPENSE,
        ...(from && to && {
            date: {
                $gte: from,
                $lte: to,
            },
        }),
    }

    const pipeline: PipelineStage[] = [
        {
            $match : filter,
        },
        {
            $group: {
                _id: "$category",
                value: {
                    $sum: {
                        $abs: {
                            $convert: {
                                input: "$amount",
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    }
                },
            },
        },
        { $sort: { value: -1 } },

        {
            $facet: {
                topThree: [{ $limit: 3 }],
                others: [
                    { $skip : 3 },
                    {
                        $group : {
                            _id : "others",
                            value : { $sum : "$value" },
                        },
                    },
                ],
            },
        },

        {
            $project : {
                categories: {
                    $concatArrays : ["$topThree",  "$others"],
                },
            },
        },

        { $unwind : "$categories" },

        {
            $group: {
                _id : null,
                totalSpent : { $sum : "$categories.value" },
                breakdown : { $push : "$categories" },
            },
        },

        {
            $project: {
                _id: 0,
                totalSpent : 1,
                breakdown : {
                    $map: {
                        input : "$breakdown",
                        as: "cat",
                        in : {
                            name: "$$cat._id",
                            value : "$$cat.value",
                            percentage: {
                                $cond : [
                                    {$eq: ["$totalSpent", 0]},
                                    0,

                                    {
                                        $round:[
                                        {
                                            $multiply: [
                                                { $divide: ["$$cat.value", "$totalSpent"]},
                                                100,
                                            ],
                                        },
                                        0,
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
            },
        },
    ]

    const result = await transactionModel.aggregate(pipeline)

    const data = result[0] || { totalSpent: 0, breakdown: [] }

    console.log(data)

    const transformedData = {
        totalSpent : convertToDollarUnit(data.totalSpent),
        breakdown: ( data.breakdown ).map((item:any) =>({
            ...item,
            value: convertToDollarUnit(item.value),
        })),
    }

    return {
        ...transformedData,
        preset: {
            ...range,
            value: rangeValue || DateRangeEnum.ALL_TIME,
            label : range?.label || "All Time",
        }
    }
}

// function calculatePercentageChange ( previous : number, current : number ) {

//     if( previous === 0 ) return current === 0 ? 0 : 100

//     const changes = (( current- previous)/Math.abs(previous)) * 100

//     const cappedChange = Math.min(Math.max(changes, -100), 100)

//     return parseFloat( cappedChange.toFixed(2) )
// }

function calculatePercentageChange(
    previous: number,
    current: number
) {

    if (previous === 0 && current === 0) {
        return 0;
    }

    if (previous === 0) {
        return null;
    }

    const changes =
        ((current - previous) / Math.abs(previous)) * 100;

    const cappedChange = Math.min(
        Math.max(changes, -500),
        500
    );

    return parseFloat(cappedChange.toFixed(2));
}


// MongoDB Aggregation Pipeline helps to perform Aggregation Function on Database.
// A MongoDB Aggregation Pipeline is a framework used to process, filter, transform, and analyze documents in a MongoDB collection.