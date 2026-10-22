import { Router } from "express"
import {
    cancelSubscriptionController,
    createSubscriptionController,
    getBillingStatusController,
    verifySubscriptionController,
} from "../controllers/billing.controller.js"

const billingRoutes = Router()

billingRoutes.get("/status", getBillingStatusController)
billingRoutes.post("/subscribe", createSubscriptionController)
billingRoutes.post("/verify", verifySubscriptionController)
billingRoutes.post("/cancel", cancelSubscriptionController)

export default billingRoutes