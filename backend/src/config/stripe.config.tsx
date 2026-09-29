import Stripe from "stripe"
import { Env } from "./env.config.js"

export const stripe = new Stripe(
    Env.STRIPE_SECRET_KEY
)