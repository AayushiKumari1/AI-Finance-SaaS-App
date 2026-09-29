import { Router } from "express"
import { createCheckoutSession } from "../controllers/billing.controller.js"

const billingRoutes = Router()

billingRoutes.post( "/create-checkout-session", createCheckoutSession )

export default billingRoutes