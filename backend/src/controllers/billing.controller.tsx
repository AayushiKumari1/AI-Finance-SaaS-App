import type { Request, Response } from "express"
import { stripe } from "../config/stripe.config.js"
import { Env } from "../config/env.config.js"

export const createCheckoutSession = async (
    req: Request,
    res: Response
) => {
    try {
        const user = req.user

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized",
            })
        }

        const session =
            await stripe.checkout.sessions.create({
                mode: "subscription",

                line_items: [
                    {
                        price: Env.STRIPE_PRO_PRICE_ID,
                        quantity: 1,
                    },
                ],

                customer_email: user.email,

                success_url:
                    `${Env.CLIENT_URL}/subscription/success`,

                cancel_url:
                    `${Env.CLIENT_URL}/subscription/cancel`,

                metadata: {
                    userId: user._id.toString(),
                    plan: "PRO",
                },
            })

        return res.status(200).json({
            url: session.url,
        })

    } catch (error) {

        console.error(
            "CREATE CHECKOUT ERROR:",
            error
        )

        return res.status(500).json({
            message: "Unable to create checkout session",
        })
    }
}