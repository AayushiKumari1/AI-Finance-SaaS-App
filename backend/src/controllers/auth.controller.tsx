import { HTTPSTATUS } from "../config/http.config.js";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import type { Request, Response } from "express"
import { loginSchema, registerSchema } from "../validators/auth.validators.js";
import { loginService, registerService } from "../services/auth.services.js";

export const RegisterController = asyncHandler( 
    
    async(req : Request , res : Response ) =>{

        const body = registerSchema.parse(req.body)
        
        const result = await registerService(body)
        
        return res.status(HTTPSTATUS.CREATED).json({ message : "User Registered Successfully", data : result })
    }
)

export const loginController = asyncHandler(

    async( req : Request, res : Response ) =>{

        const body = loginSchema.parse({
            ...req.body,
        })

        const { user, accessToken, expiresAt, reportSetting } = await loginService(body)

        return res.status(HTTPSTATUS.OK).json({

            message : "User logged in Successfully.",
            user,
            accessToken,
            expiresAt,
            reportSetting,
        })
    }
)