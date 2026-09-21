import type { Request, Response } from 'express'
import { asyncHandler } from '../middlewares/asyncHandler.middleware.js'
import { HTTPSTATUS } from '../config/http.config.js'
import type { DateRangePreset } from '../enums/date_range.enum.js'
import { chartAnalyticsService, expensePieChartBreakdownService, summaryAnalyticsService } from '../services/analytics.service.js'

export const summaryAnalyticsController =  asyncHandler(

    async( req : Request, res : Response ) =>{

        const userId = req.user?._id

        const { preset, from, to } = req.query

        const filter = {
            dateRangePreset: preset as DateRangePreset,
            customFrom: from ? new Date(from as string) : undefined,
            customTo : to ? new Date( to as string ) : undefined
        }

        const stats = await summaryAnalyticsService(
            userId,
            filter.dateRangePreset,
            filter.customFrom,
            filter.customTo,
        )

        return res.status(HTTPSTATUS.OK).json({
            message: "Summary fetched Successfully.",
            data : stats,
        })
    }
)

export const chartAnalyticsController = asyncHandler( 

    async( req: Request, res: Response ) =>{

        const userId = req.user?._id
        const { preset, from, to } = req.query

        const filter = {

            dateRangePreset : preset as DateRangePreset,
            customFrom : from ? new Date(from as string) : undefined,
            customTo : to ? new Date(to as string) : undefined,
        }

        const chartData = await chartAnalyticsService(
            userId,
            filter.dateRangePreset,
            filter.customFrom,
            filter.customTo,
        )

        return  res.status(HTTPSTATUS.OK).json({
            message : "Chart Fetched Successfully",
            data: chartData,
        })
    }
)

export const expensePieChartBreakdownController = asyncHandler(

    async( req: Request, res: Response ) =>{

        const userId = req.user?._id
        const { preset, from , to } = req.query
        const filter = {
            dateRangePreset: preset as DateRangePreset,
            customFrom : from ? new Date(from as string) : undefined,
            customTo : to ? new Date(to as string) : undefined,
        }

        const pieChartData = expensePieChartBreakdownService(
            userId,
            filter.dateRangePreset,
            filter.customFrom,
            filter.customTo,
        )

        return res.status(HTTPSTATUS.OK).json({
            message: "Expense Breakdown Fetched Successfully",
            data : pieChartData,
        })
    }
)