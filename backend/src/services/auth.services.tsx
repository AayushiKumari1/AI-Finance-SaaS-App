import type { LoginSchemaType, RegisterSchemaType } from "../validators/auth.validators.js";
import { UserModel } from "../models/user.model.js"
import { NotFoundException, UnauthorizedException } from "../utils/app_error.js";
import mongoose from "mongoose";
import ReportSettingModel, { ReportFrequencyEnum } from "../models/report_setting.model.js";
import { calculateNextReportDate } from "../utils/helper.js";
import { signJwtToken } from "../utils/jwt.js";

export const registerService = async( body : RegisterSchemaType ) =>{

    const { email } = body

    const session = await mongoose.startSession()

    try{
        
        await session.withTransaction( async()=>{

            const exsistingUser = await UserModel.findOne({email})

            if( exsistingUser ) throw new UnauthorizedException("User already exsists")

            const newUser = new UserModel({
                ...body,
            })

            await newUser.save({ session })

            const reportSetting = new ReportSettingModel({

                userId : newUser._id,
                frequency : ReportFrequencyEnum.MONTHLY,
                isEnabled : true,
                lastSentDate : null,
                nextReportDate : calculateNextReportDate()
            })

            await reportSetting.save({ session })

            return { user : newUser.omitPassword }
        })
    }
    catch( error ){

        throw error
    }
    finally{
        await session.endSession()
    }
}

export const loginService = async( body : LoginSchemaType ) => {

    const { email, password } = body
    const user = await UserModel.findOne({ email })

    console.log("User found:", user ? user.email : null);

    if( !user ){
        throw new NotFoundException("Email/Password not Found.")
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) throw new UnauthorizedException("Invalid Email/Password");

    const { token, expiresAt } = signJwtToken({ userId : user.id })

    const reportSetting = await ReportSettingModel.findOne({
        userId : user.id
    }, { _id : 1, frequency : 1, isEnabled : 1 } 
    ).lean()

    return {
        user : user.omitPassword(),
        accessToken : token,
        expiresAt,
        reportSetting,
    }
}


// We will use Mongoose Transaction if a User enters and Registers a User and Report is Created and if the Payment fails then then it should Rollback the Data. So, This is why we are using the Transaction.