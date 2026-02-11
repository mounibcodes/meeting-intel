// Pricing plans configuration - no Stripe dependency
export const PLANS = {
  FREE: {
    name: "Free",
    description: "Get started with basic features",
    price: 0,
    priceId: null,
    minutes: 120, // 2 hours/month
    features: [
      "2 hours recording/month",
      "AI transcription",
      "Basic summaries",
      "Email support",
    ],
  },
  PRO: {
    name: "Pro",
    description: "For growing teams",
    price: 39,
    priceId: process.env.STRIPE_PRO_PRICE_ID || null,
    minutes: 600, // 10 hours/month
    features: [
      "10 hours recording/month",
      "AI transcription",
      "Advanced summaries",
      "Action items extraction",
      "Follow-up email generation",
      "Priority support",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    description: "For large organizations",
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || null,
    minutes: 3000, // 50 hours/month
    features: [
      "50 hours recording/month",
      "Everything in Pro",
      "Team collaboration",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanByPriceId(priceId: string): PlanKey | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) {
      return key as PlanKey;
    }
  }
  return null;
}

export function getMinutesLimit(tier: PlanKey): number {
  return PLANS[tier].minutes;
}
