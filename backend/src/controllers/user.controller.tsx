import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { type Request, type Response } from 'express'
import { findByIdUserService } from "../services/user.service.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { updateUserSchema } from "../validators/user.validator.js";
import { updateUserService } from "../services/user.service.js";

export const getCurrentUserController =  asyncHandler(

    async( req : Request, res : Response ) =>{

        const userId = req.user?._id

        const user = await findByIdUserService(userId)
        return res.status(HTTPSTATUS.OK).json({
            message: "User fetched Successfully.",
            user,
        })
    }
)

export const updateUserController = asyncHandler((

    async( req: Request, res: Response ) => {

        const body = updateUserSchema.parse(req.body)
        const userId = req.user?._id
        const profilePic = req.file
        
        const user = await updateUserService(userId, body, profilePic)
        
        return res.status(HTTPSTATUS.OK).json({
            message: "User Profile Updated.",
            data : user,
        })
    }
))