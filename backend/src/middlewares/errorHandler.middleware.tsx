import type { ErrorRequestHandler , Response } from "express"
import { HTTPSTATUS } from "../config/http.config.js"
import { AppError } from "../utils/app_error.js"
import { ZodError } from "zod/v4"
import { ErrorCodeEnum } from "../enums/error_code.enum.js"
import multer, { MulterError } from "multer"

const formatZodError = ( res : Response, error : ZodError<unknown> ) => {

    const errors = error ?.issues?.map((err) =>({

        field : err.path.join("."),
        message : err.message
    }))

    return res.status(HTTPSTATUS.BAD_REQUEST).json({

        message : "Validation Failed",
        errors: errors,
        errorCode : ErrorCodeEnum.VALIDATION_ERROR
    })
}

const handleMulterError = ( error: MulterError ) =>{

    const messages = {
        LIMIT_UNEXPECTED_FILE: "Invalid file field name. Please use 'file'",
        LIMIT_FILE_SIZE: "File Size Exceeds the Limit.",
        LIMIT_FILE_COUNT : "Too Many Files Uploaded.",
        default: "File Upload Error",
    }

    return{
        status: HTTPSTATUS.BAD_REQUEST,
        message: messages[error.code as keyof typeof messages] || messages.default,
        error: error.message,
    }
}

export const errorHandler:ErrorRequestHandler = ( error , req , res , next ) : any => { // ErrorRequestHandler - It si used to describe the function that handles Error.

    console.log( " Error Occurred on the Path : ", req.path, "Error", error )

    // We want to make the Error more cleaner
    if( error instanceof ZodError ){

        return formatZodError( res, error )
    }
    
    if( error instanceof MulterError ){

        const {status, message, error:err} = handleMulterError(error)
        
        return res.status(status).json({
            message,
            error: err,
            errorCode : ErrorCodeEnum.FILE_UPLOAD_ERROR,
        })
    }
    
    if( error instanceof AppError ){

        return res.status( error.statusCode).json({

            message : error.message,
            errorCode : error.errorCode
        })
    }
    
    return res.status( HTTPSTATUS.INTERNAL_SERVER_ERROR).json(  {
        message : "Internal Server Error",
        error : error?.message || "Unknown Error Occurred"
    })
}