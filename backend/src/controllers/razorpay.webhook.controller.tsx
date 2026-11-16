import type { Request, Response } from "express"
import crypto from "crypto"
import { WebhookEventModel } from "../models/webhook-event.model.js"
import {
    isValidWebhookSignature,
    syncUserFromSubscription,
} from "../services/billing.service.js"

const SUBSCRIPTION_EVENTS = new Set([
    "subscription.authenticated",
    "subscription.activated",
    "subscription.charged",
    "subscription.pending",
    "subscription.halted",
    "subscription.cancelled",
    "subscription.completed",
    "subscription.updated",
])

export const razorpayWebhookController = async (req: Request, res: Response) => {
    const signature = req.headers["x-razorpay-signature"]
    const rawBody = req.body as Buffer

    if (
        typeof signature !== "string" ||
        !Buffer.isBuffer(rawBody) ||
        !isValidWebhookSignature(rawBody, signature)
    ) {
        console.error("Razorpay webhook: invalid signature")
        return res.status(400).send("Invalid signature")
    }

    let payload: any
    try {
        payload = JSON.parse(rawBody.toString("utf8"))
    } catch {
        return res.status(400).send("Invalid JSON")
    }

    const eventType: string = payload.event
    const headerId = req.headers["x-razorpay-event-id"]
    const eventId =
        typeof headerId === "string" && headerId
            ? headerId
            : crypto.createHash("sha256").update(rawBody).digest("hex")

    try {
        await WebhookEventModel.create({ eventId, event: eventType })
    } catch (error: any) {
        if (error?.code === 11000) {
            return res.status(200).json({ received: true, duplicate: true })
        }
        console.error("Razorpay webhook: could not record event", error)
        return res.status(500).send("Server error")
    }

    try {
        if (SUBSCRIPTION_EVENTS.has(eventType)) {
            const entity = payload?.payload?.subscription?.entity
            if (entity?.id) {
                await syncUserFromSubscription(entity)
            }
        }
        
        return res.status(200).json({ received: true })
    } catch (error) {
        console.error("Razorpay webhook: processing failed", error)
        await WebhookEventModel.deleteOne({ eventId }).catch(() => undefined)
        return res.status(500).send("Processing error")
    }
}
