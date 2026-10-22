import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Check, Loader } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTypedSelector } from "@/app/hook";
import {
  useCancelSubscriptionMutation,
  useCreateSubscriptionMutation,
  useGetBillingStatusQuery,
  useVerifySubscriptionMutation,
} from "@/features/billing/billingAPI";
import { loadRazorpay } from "@/lib/load-razorpay";

const PRO_PRICE_LABEL = "₹399 / month";

const PRO_FEATURES = [
  "AI receipt scanning",
  "Unlimited transactions & CSV import",
  "AI-powered monthly reports",
  "Cancel anytime — access continues until the period ends",
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const Billing = () => {
  const user = useTypedSelector((state) => state.auth.user);

  const { data: billing, isLoading, refetch } = useGetBillingStatusQuery();
  const [createSubscription] = useCreateSubscriptionMutation();
  const [verifySubscription] = useVerifySubscriptionMutation();
  const [cancelSubscription, { isLoading: isCancelling }] =
    useCancelSubscriptionMutation();

  const [isUpgrading, setIsUpgrading] = useState(false);

  const isPro = billing?.hasProAccess ?? false;
  const periodEnd = billing?.currentPeriodEnd
    ? format(new Date(billing.currentPeriodEnd), "MMM d, yyyy")
    : null;

  const waitForActivation = async () => {
    for (let i = 0; i < 5; i++) {
      const result = await refetch().unwrap();
      if (result.hasProAccess) return true;
      await wait(2000);
    }
    return false;
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        toast.error("Could not load the payment window. Check your connection.");
        setIsUpgrading(false);
        return;
      }

      const sub = await createSubscription().unwrap();

      const rzp = new window.Razorpay({
        key: sub.keyId,
        subscription_id: sub.subscriptionId,
        name: "Finora.AI",
        description: "Pro plan",
        prefill: { name: sub.name || user?.name, email: sub.email },
        theme: { color: "#2563eb" },
        handler: async (response) => {
          try {
            const result = await verifySubscription(response).unwrap();
            if (result.hasProAccess || (await waitForActivation())) {
              toast.success("You're on Pro now. Thank you!");
            } else {
              toast.info(
                "Payment received. Your plan will activate in a moment — refresh shortly."
              );
            }
          } catch (error: any) {
            toast.error(
              error?.data?.message ||
                "Payment verification failed. If money was deducted, contact support."
            );
          } finally {
            setIsUpgrading(false);
          }
        },
        modal: {
          // user closed the window without paying
          ondismiss: () => setIsUpgrading(false),
        },
      });

      rzp.on("payment.failed", (response: any) => {
        toast.error(response?.error?.description || "Payment failed. Please try again.");
        setIsUpgrading(false);
      });

      rzp.open();
    } catch (error: any) {
      toast.error(error?.data?.message || "Unable to start checkout");
      setIsUpgrading(false);
    }
  };

  const handleCancel = async () => {
    const ok = window.confirm(
      "Cancel your Pro subscription? You'll keep Pro access until the end of the current billing period."
    );
    if (!ok) return;

    try {
      await cancelSubscription().unwrap();
      toast.success("Subscription will end at the close of this billing period.");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to cancel subscription");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Billing</h3>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>
      <Separator />

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader className="h-4 w-4 animate-spin" /> Loading billing details…
        </div>
      ) : (
        <div className="rounded-lg border p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-semibold">
                  {isPro ? "Pro plan" : "Free plan"}
                </h4>
                <Badge variant={isPro ? "default" : "secondary"}>
                  {isPro ? "Active" : "Current"}
                </Badge>
              </div>
              {isPro && periodEnd && (
                <p className="text-sm text-muted-foreground mt-1">
                  {billing?.cancelAtPeriodEnd || billing?.status === "cancelled"
                    ? `Cancelled — Pro access ends on ${periodEnd}`
                    : `Renews on ${periodEnd}`}
                </p>
              )}
              {!isPro && (
                <p className="text-sm text-muted-foreground mt-1">
                  Upgrade to unlock AI features.
                </p>
              )}
            </div>
            {!isPro && (
              <p className="text-lg font-semibold">{PRO_PRICE_LABEL}</p>
            )}
          </div>

          <ul className="space-y-2">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {!isPro && (
            <Button onClick={handleUpgrade} disabled={isUpgrading}>
              {isUpgrading && <Loader className="h-4 w-4 animate-spin" />}
              Upgrade to Pro
            </Button>
          )}

          {isPro && !billing?.cancelAtPeriodEnd && billing?.status === "active" && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling && <Loader className="h-4 w-4 animate-spin" />}
              Cancel subscription
            </Button>
          )}

          <p className="text-xs text-muted-foreground">
            Payments are processed securely by Razorpay. We never see or store
            your card details.
          </p>
        </div>
      )}
    </div>
  );
};

export default Billing;