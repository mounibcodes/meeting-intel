import Stripe from "stripe";

// Re-export plans from separate file
export { PLANS, getPlanByPriceId, getMinutesLimit } from "./plans";
export type { PlanKey } from "./plans";

// Stripe client - only initialize if key is set
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-01-27.acacia",
      typescript: true,
    })
  : null;
