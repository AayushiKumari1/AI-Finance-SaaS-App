import mongoose, { Schema, type Document } from "mongoose"

// One row per processed Razorpay webhook. The unique index on eventId is what makes
// the webhook idempotent: Razorpay retries deliveries, so the same event can arrive twice.
export interface WebhookEventDocument extends Document {
    eventId: string
    event: string
    createdAt: Date
}

const webhookEventSchema = new Schema<WebhookEventDocument>({
    eventId: { type: String, required: true, unique: true },
    event: { type: String, required: true },
    // TTL index: rows delete themselves after 30 days so the collection doesn't grow forever.
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 },
})

export const WebhookEventModel = mongoose.model<WebhookEventDocument>(
    "WebhookEvent",
    webhookEventSchema
)