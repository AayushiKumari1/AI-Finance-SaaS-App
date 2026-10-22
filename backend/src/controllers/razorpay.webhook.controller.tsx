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

/**
 * POST /api/billing/webhook
 * IMPORTANT: mounted with express.raw() BEFORE express.json() in index.tsx, because the
 * signature is computed over the exact bytes Razorpay sent. req.body is a Buffer here.
 */
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
    // Razorpay sends a unique id per event; fall back to a hash of the body just in case.
    const headerId = req.headers["x-razorpay-event-id"]
    const eventId =
        typeof headerId === "string" && headerId
            ? headerId
            : crypto.createHash("sha256").update(rawBody).digest("hex")

    // ---- idempotency: have we already handled this exact event? ----
    try {
        await WebhookEventModel.create({ eventId, event: eventType })
    } catch (error: any) {
        if (error?.code === 11000) {
            // duplicate key -> already processed. Say OK so Razorpay stops retrying.
            return res.status(200).json({ received: true, duplicate: true })
        }
        console.error("Razorpay webhook: could not record event", error)
        return res.status(500).send("Server error")
    }

    // ---- handle the event ----
    try {
        if (SUBSCRIPTION_EVENTS.has(eventType)) {
            const entity = payload?.payload?.subscription?.entity
            if (entity?.id) {
                await syncUserFromSubscription(entity)
            }
        }
        // payment.failed etc. are intentionally ignored: the subscription.* events
        // already tell us when access should change.

        return res.status(200).json({ received: true })
    } catch (error) {
        console.error("Razorpay webhook: processing failed", error)
        // Forget the event so Razorpay's retry gets processed instead of skipped as a duplicate.
        await WebhookEventModel.deleteOne({ eventId }).catch(() => undefined)
        return res.status(500).send("Processing error")
    }
}