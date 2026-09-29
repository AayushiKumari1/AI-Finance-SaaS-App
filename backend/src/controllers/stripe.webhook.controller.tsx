import type { Request, Response } from "express"
import Stripe from "stripe"
import { stripe } from "../config/stripe.config.js"
import { Env } from "../config/env.config.js"

export const stripeWebhook = async (
    req: Request,
    res: Response
) => {

    const signature =
        req.headers["stripe-signature"]

    let event: Stripe.Event

    try {

        event = stripe.webhooks.constructEvent(
            req.body,
            signature!,
            Env.STRIPE_WEBHOOK_SECRET
        )

    } catch (error) {

        console.error(
            "Stripe webhook verification failed:",
            error
        )

        return res.status(400).send(
            "Webhook Error"
        )
    }

    console.log(
        "STRIPE EVENT:",
        event.type
    )

    switch (event.type) {

        case "checkout.session.completed": {

            const session =
                event.data.object as Stripe.Checkout.Session

            console.log(
                "CHECKOUT COMPLETED:",
                session.id
            )

            break
        }

        case "customer.subscription.updated": {

            const subscription =
                event.data.object as Stripe.Subscription

            console.log(
                "SUBSCRIPTION UPDATED:",
                subscription.id
            )

            break
        }

        case "customer.subscription.deleted": {

            const subscription =
                event.data.object as Stripe.Subscription

            console.log(
                "SUBSCRIPTION CANCELLED:",
                subscription.id
            )

            break
        }

        case "invoice.paid": {

            console.log(
                "INVOICE PAID"
            )

            break
        }

        case "invoice.payment_failed": {

            console.log(
                "INVOICE PAYMENT FAILED"
            )

            break
        }
    }

    return res.json({
        received: true,
    })
}