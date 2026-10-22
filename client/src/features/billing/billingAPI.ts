import { apiClient } from "@/app/api-client";
import {
  BillingStatusResponse,
  CreateSubscriptionResponse,
  VerifySubscriptionPayload,
} from "./billingType";

export const billingApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    getBillingStatus: builder.query<BillingStatusResponse, void>({
      query: () => ({ url: "/billing/status", method: "GET" }),
      providesTags: ["billingSubscription"],
    }),
    createSubscription: builder.mutation<CreateSubscriptionResponse, void>({
      query: () => ({ url: "/billing/subscribe", method: "POST" }),
    }),
    verifySubscription: builder.mutation<
      BillingStatusResponse,
      VerifySubscriptionPayload
    >({
      query: (body) => ({ url: "/billing/verify", method: "POST", body }),
      invalidatesTags: ["billingSubscription"],
    }),
    cancelSubscription: builder.mutation<BillingStatusResponse, void>({
      query: () => ({ url: "/billing/cancel", method: "POST" }),
      invalidatesTags: ["billingSubscription"],
    }),
  }),
});

export const {
  useGetBillingStatusQuery,
  useCreateSubscriptionMutation,
  useVerifySubscriptionMutation,
  useCancelSubscriptionMutation,
} = billingApi;