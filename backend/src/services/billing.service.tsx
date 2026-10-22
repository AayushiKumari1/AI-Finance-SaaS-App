import crypto from "crypto"
import type { Subscriptions } from "razorpay/dist/types/subscriptions.js"
import { razorpay, isRazorpayConfigured } from "../config/razorpay.config.js"
import { Env } from "../config/env.config.js"
import { UserModel, type SubscriptionStatus } from "../models/user.model.js"
import {
    AppError,
    BadRequestException,
    NotFoundException,
} from "../utils/app_error.js"
import { HTTPSTATUS } from "../config/http.config.js"
import type { VerifySubscriptionType } from "../validators/billing.validator.js"


const safeEqualHex = (a: string, b: string) => {
    const bufA = Buffer.from(a, "utf8")
    const bufB = Buffer.from(b, "utf8")

    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)
}

const hmacSha256Hex = (secret: string, payload: string | Buffer) =>
    crypto.createHmac("sha256", secret).update(payload).digest("hex")

/**
 * Does this user currently get Pro features?
 *  - active                       -> yes
 *  - pending (a renewal charge failed, Razorpay is retrying) -> yes (grace period)
 *  - cancelled but period not over -> yes until currentPeriodEnd (they already paid for it)
 *  - everything else              -> no
 */
export const hasProAccess = (user: {
    subscriptionPlan?: string | null
    subscriptionStatus?: string | null
    currentPeriodEnd?: Date | string | null
}) => {
    if (user.subscriptionPlan !== "PRO") return false

    const status = user.subscriptionStatus
    if (status === "active" || status === "pending") return true

    if (status === "cancelled" && user.currentPeriodEnd) {
        return new Date(user.currentPeriodEnd).getTime() > Date.now()
    }
    return false
}

export const isValidCheckoutSignature = (
    paymentId: string,
    subscriptionId: string,
    signature: string
) => {
    const expected = hmacSha256Hex(
        Env.RAZORPAY_KEY_SECRET,
        `${paymentId}|${subscriptionId}`
    )
    return safeEqualHex(expected, signature)
}

export const isValidWebhookSignature = (rawBody: Buffer, signature: string) => {

    if (!Env.RAZORPAY_WEBHOOK_SECRET) return false
    const expected = hmacSha256Hex(Env.RAZORPAY_WEBHOOK_SECRET, rawBody)
    return safeEqualHex(expected, signature)
}

export const syncUserFromSubscription = async (
    sub: Pick<Subscriptions.RazorpaySubscription, "id" | "status" | "current_end">
) => {

    const user = await UserModel.findOne({ razorpaySubscriptionId: sub.id })
    if (!user) return null

    const status = sub.status as SubscriptionStatus
    user.subscriptionStatus = status

    if (sub.current_end) {
        user.currentPeriodEnd = new Date(sub.current_end * 1000)
    }

    switch (status) {
        case "active":
        case "pending":
            user.subscriptionPlan = "PRO"
            break

        case "cancelled": {
            const stillPaidFor =
                user.currentPeriodEnd && user.currentPeriodEnd.getTime() > Date.now()
            user.subscriptionPlan = stillPaidFor ? "PRO" : "FREE"
            user.cancelAtPeriodEnd = false
            break
        }

        case "halted":
        case "completed":
        case "expired":
            user.subscriptionPlan = "FREE"
            user.cancelAtPeriodEnd = false
            break

        default:
            // created / authenticated: mandate set up, but no money charged yet -> no Pro yet.
            break
    }

    await user.save()
    return user
}

// ---------- use-cases called by controllers ----------

export const createProSubscriptionService = async (userId: string) => {
    if (!isRazorpayConfigured()) {
        throw new AppError(
            "Billing is not configured on the server.",
            HTTPSTATUS.SERVICE_UNAVAILABLE
        )
    }

    const user = await UserModel.findById(userId)
    if (!user) throw new NotFoundException("User Not Found.")

    if (hasProAccess(user)) {
        throw new BadRequestException("You are already on the Pro plan.")
    }

    const subscription = await razorpay.subscriptions.create({
        plan_id: Env.RAZORPAY_PRO_PLAN_ID,
        total_count: 12,
        customer_notify: 1,
        notes: { userId: String(user._id), plan: "PRO" },
    })

    user.razorpaySubscriptionId = subscription.id
    user.subscriptionStatus = "created"
    await user.save()

    return {
        subscriptionId: subscription.id,
        keyId: Env.RAZORPAY_KEY_ID,
        name: user.name,
        email: user.email,
    }
}

export const verifySubscriptionService = async (
    userId: string,
    body: VerifySubscriptionType
) => {
    const user = await UserModel.findById(userId)
    if (!user) throw new NotFoundException("User Not Found.")

    if (user.razorpaySubscriptionId !== body.razorpay_subscription_id) {
        throw new BadRequestException("Subscription does not belong to this account.")
    }

    if (
        !isValidCheckoutSignature(
            body.razorpay_payment_id,
            body.razorpay_subscription_id,
            body.razorpay_signature
        )
    ) {
        throw new BadRequestException("Payment signature verification failed.")
    }

    const latest = await razorpay.subscriptions.fetch(body.razorpay_subscription_id)
    const updated = await syncUserFromSubscription(latest)

    return updated ?? user
}

export const cancelSubscriptionService = async (userId: string) => {
    const user = await UserModel.findById(userId)
    if (!user) throw new NotFoundException("User Not Found.")

    if (!user.razorpaySubscriptionId || user.subscriptionStatus !== "active") {
        throw new BadRequestException("There is no active subscription to cancel.")
    }

    await razorpay.subscriptions.cancel(user.razorpaySubscriptionId, true)

    user.cancelAtPeriodEnd = true
    await user.save()

    return user
}