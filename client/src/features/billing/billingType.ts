export type SubscriptionStatus =
  | "none"
  | "created"
  | "authenticated"
  | "active"
  | "pending"
  | "halted"
  | "cancelled"
  | "completed"
  | "expired";

export interface BillingStatusResponse {
  message: string;
  plan: "FREE" | "PRO";
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasProAccess: boolean;
}

export interface CreateSubscriptionResponse {
  message: string;
  subscriptionId: string;
  keyId: string;
  name: string;
  email: string;
}

export interface VerifySubscriptionPayload {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}