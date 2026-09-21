import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken"
import { Env } from "../config/env.config.js"

type TimeUnit = 's' | 'm' | 'h' | 'd' |'w' | 'y'
type TimeString = `${number}${TimeUnit}`

export type AccessTokenPayload = {
    userId : string
}

type SignOptsAndSecret = SignOptions & {

    secret : string
}

const defaults : SignOptions = {
    audience : "user"
}

const accessTokenSignOptions : SignOptsAndSecret = {

    expiresIn : Env.JWT_EXPIRES_IN as TimeString,
    secret : Env.JWT_SECRET,
}

export const signJwtToken = (
    payload : AccessTokenPayload,
    options ?: SignOptsAndSecret
) =>{
    const isAccess = !options || options === accessTokenSignOptions

    const { secret, ...opts } = options || accessTokenSignOptions

    const token = jwt.sign( payload, secret, {
        ...defaults,
        ...opts,
    })

    const expiresAt = isAccess ? ( jwt.decode(token) as JwtPayload ) ?.exp ! * 1000 : undefined

    return {
        token,
        expiresAt   
    }
}
