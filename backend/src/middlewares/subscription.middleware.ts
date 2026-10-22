import type { NextFunction, Request, Response } from "express"
import { hasProAccess } from "../services/billing.service.js"

export const requirePro = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !hasProAccess(req.user)) {
        return res.status(403).json({
            message: "Pro subscription required",
            errorCode: "PRO_REQUIRED",
        })
    }
    next()
}