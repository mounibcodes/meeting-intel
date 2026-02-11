import Stripe from "stripe";

// Re-export plans from separate file
export { PLANS, getPlanByPriceId, getMinutesLimit } from "./plans";
export type { PlanKey } from "./plans";

// Stripe client - only initialize if key is set
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    })
  : null;
