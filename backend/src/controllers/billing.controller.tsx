import type { Request, Response } from "express"
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js"
import { HTTPSTATUS } from "../config/http.config.js"
import { verifySubscriptionSchema } from "../validators/billing.validator.js"
import {
    cancelSubscriptionService,
    createProSubscriptionService,
    hasProAccess,
    verifySubscriptionService,
} from "../services/billing.service.js"

const billingSummary = (user: {
    subscriptionPlan?: string | null
    subscriptionStatus?: string | null
    currentPeriodEnd?: Date | string | null
    cancelAtPeriodEnd?: boolean | null
}) => ({
    plan: user.subscriptionPlan ?? "FREE",
    status: user.subscriptionStatus ?? "none",
    currentPeriodEnd: user.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: Boolean(user.cancelAtPeriodEnd),
    hasProAccess: hasProAccess(user),
})

export const createSubscriptionController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = String(req.user?._id)
        const data = await createProSubscriptionService(userId)

        return res.status(HTTPSTATUS.OK).json({
            message: "Subscription created.",
            ...data,
        })
    }
)

export const verifySubscriptionController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = String(req.user?._id)
        const body = verifySubscriptionSchema.parse(req.body)
        const user = await verifySubscriptionService(userId, body)

        return res.status(HTTPSTATUS.OK).json({
            message: "Payment verified.",
            ...billingSummary(user),
        })
    }
)

export const getBillingStatusController = asyncHandler(
    async (req: Request, res: Response) => {
        return res.status(HTTPSTATUS.OK).json({
            message: "Billing status fetched.",
            ...billingSummary(req.user ?? {}),
        })
    }
)

export const cancelSubscriptionController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = String(req.user?._id)
        const user = await cancelSubscriptionService(userId)

        return res.status(HTTPSTATUS.OK).json({
            message: "Subscription will be cancelled at the end of the billing period.",
            ...billingSummary(user),
        })
    }
)