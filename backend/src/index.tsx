import 'dotenv/config'
import './config/passport.config.js'
import express, { 
    type Request, 
    type Response, 
    type NextFunction, } from 'express'

import cors from 'cors'
import { Env } from './config/env.config.js'
import { HTTPSTATUS } from './config/http.config.js'
import { errorHandler } from './middlewares/errorHandler.middleware.js'
// import { BadInternalRequestException } from './utils/app_error.js'
import { asyncHandler } from './middlewares/asyncHandler.middleware.js'
import connectDatabase from './config/database.config.js'
import authRoutes from './routes/auth.route.js'
import { passportAuthenticateJwt } from './config/passport.config.js'
import userRoutes from './routes/user.route.js'
import transactionRoutes from './routes/transaction.route.js'
import { intializeCrons } from './cron/index.js'
import reportRoutes from './routes/report.route.js'
import { getDateRange } from './utils/date.js'
import analyticsRoutes from './routes/analytics.route.js'

const app = express()
const BASE_PATH = Env.BASE_PATH

app.use( express.json() )
app.use( express.urlencoded({ extended : true }))

app.use(

    cors({
        origin: Env.FRONTEND_ORIGIN,
        credentials: true,
    })
)

app.get('/', asyncHandler( async(req : Request , res : Response , next : NextFunction ) =>{

    res.status( HTTPSTATUS.OK ).json({
        message : " Hello "
    })
    
    // throw new BadInternalRequestException("This is a test Error.")

})) // We made Async now the Error is passed down to the Handler. Instead of creating a Middleware we are going to create a Single AsyncHandler.
// We create so we don't need to write the code of try and catch every time.
// We create asyncHandler separately so that every async Express controller can automatically send its errors to your centralized errorHandler,
//  without repeating try/catch in every route

app.use( `${BASE_PATH}/auth`, authRoutes )
app.use( `${BASE_PATH}/user`, passportAuthenticateJwt, userRoutes )
app.use(`${BASE_PATH}/transaction`, passportAuthenticateJwt, transactionRoutes )

app.use(`${BASE_PATH}/report`, passportAuthenticateJwt, reportRoutes )
app.use(`${BASE_PATH}/analytics`, passportAuthenticateJwt, analyticsRoutes )

app.use( errorHandler ) // We are going to last Middleware before the App.listen()

const date = getDateRange("lastMonth")
console.log(date)

app.listen( Env.PORT, async()=>{

    await connectDatabase()
    
    if( Env.NODE_ENV === "development" ){
        await intializeCrons()
    }

    console.log( `Server is runnung on PORT ${ Env.PORT } in ${ Env.NODE_ENV } node`)
})
