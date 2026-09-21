import type { Request, Response } from 'express'
import { HTTPSTATUS } from '../config/http.config.js'
import { getAllReportService, updateReportSettingService, generateReportService } from '../services/report.service.js'
import { asyncHandler } from '../middlewares/asyncHandler.middleware.js'
import { updateReportSettingSchema } from '../validators/report.validator.js'

export const getAllReportsController = asyncHandler(

    async( req:Request, res:Response ) =>{

        const userId = req.user?._id
        const pagination = {
            pageSize: parseInt(req.query.pageSize as string ) || 20,
            pageNumber: parseInt(req.query.pageNumber as string ) || 1,
        }

        const result = await getAllReportService( userId, pagination )

        return res.status(HTTPSTATUS.OK).json({
            message: "Reports History Fetched Successfully.",
            ...result
        })
    }
)

export const updateReportSettingController = asyncHandler(

    async( req:Request, res:Response ) =>{

        const userId = req.user?._id
        const body = updateReportSettingSchema.parse(req.body)
        
        await updateReportSettingService( userId, body )
        
        return res.status(HTTPSTATUS.OK).json({
            message: "Reports Setting Updated Successfully.",
        })
    }
)

export const generateReportController = asyncHandler(

    async( req:Request, res:Response ) =>{

        const userId = req.user?._id
        const { from , to } = req.query
        const fromDate = new Date( from as string )
        const toDate = new Date( to as string )

        const results = await generateReportService( userId, fromDate, toDate )
        
        return res.status(HTTPSTATUS.OK).json({
            message: "Reports generated Successfully.",
            ...results
        })
    }
)