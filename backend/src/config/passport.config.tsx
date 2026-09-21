import { ExtractJwt, Strategy as JwtStrategy, type StrategyOptions } from 'passport-jwt'
import passport from "passport"
import { Env } from "./env.config.js"
import { findByIdUserService } from '../services/user.service.js'

interface JwtPayload {
    userId : string
}

const options : StrategyOptions = {

    jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey : Env.JWT_SECRET,
    audience : ["user"],
    algorithms : ["HS256"]
}

passport.use(
    new JwtStrategy(options, async( payload : JwtPayload, done ) =>{
        
        try{

            if( !payload.userId ){    
                return done(null, false, {message : "Invalid Token Payload" })
            }

            const user = await findByIdUserService( payload.userId )

            if( !user ){
                return done( null, false )
            }

            return done( null, user )
        }
        catch(error){

            return done( error, false )
        }
    })
)

passport.serializeUser((user: any, done) => done( null, user ) )

passport.deserializeUser((user:any, done) => done( null, user ) )

export const passportAuthenticateJwt = passport.authenticate("jwt", {
    session: false,
})