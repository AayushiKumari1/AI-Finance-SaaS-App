import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "./store";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const auth = (getState() as RootState).auth;
    if (auth?.accessToken) {
      headers.set("Authorization", `Bearer ${auth.accessToken}`);
    }
    return headers;
  },
});

export const apiClient = createApi({
  reducerPath: "api",
  baseQuery: baseQuery,
  refetchOnMountOrArgChange: true, 
  tagTypes: ["transactions", "analytics", "billingSubscription"], 
  endpoints: () => ({}), 
});
