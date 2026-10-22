import { z } from "zod"

export const verifySubscriptionSchema = z.object({
    razorpay_payment_id: z.string().min(1),
    razorpay_subscription_id: z.string().min(1),
    razorpay_signature: z.string().min(1),
})

export type VerifySubscriptionType = z.infer<typeof verifySubscriptionSchema>