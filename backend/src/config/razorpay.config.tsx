import Razorpay from "razorpay"
import { Env } from "./env.config.js"

export const razorpay = new Razorpay({
    key_id: Env.RAZORPAY_KEY_ID || "rzp_test_missing",
    key_secret: Env.RAZORPAY_KEY_SECRET || "missing",
})

export const isRazorpayConfigured = () =>
    Boolean(Env.RAZORPAY_KEY_ID && Env.RAZORPAY_KEY_SECRET && Env.RAZORPAY_PRO_PLAN_ID)