import { type Request, type Response, type NextFunction } from "express"

type AsynControllerType = (
    req : Request,
    res : Response,
    next : NextFunction
) => Promise<any>;

export const asyncHandler = ( controller : AsynControllerType ) : AsynControllerType =>

    async ( req, res, next ) =>{

        try{
            await controller( req, res, next )
        } 
        catch( error ){
            next( error )
        }
}
