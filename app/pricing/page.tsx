"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";

const plans = [
  {
    name: "Free",
    price: 0,
    description: "Get started with basic features",
    priceId: null,
    minutes: 120,
    features: [
      "2 hours recording/month",
      "AI transcription",
      "Basic summaries",
      "Email support",
    ],
    cta: "Current Plan",
    popular: false,
  },
  {
    name: "Pro",
    price: 39,
    description: "For growing teams",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    minutes: 600,
    features: [
      "10 hours recording/month",
      "AI transcription",
      "Advanced summaries",
      "Action items extraction",
      "Follow-up email generation",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: 99,
    description: "For large organizations",
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
    minutes: 3000,
    features: [
      "50 hours recording/month",
      "Everything in Pro",
      "Team collaboration",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
    ],
    cta: "Upgrade to Enterprise",
    popular: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string | null | undefined) => {
    if (!priceId) return;

    if (!isSignedIn) {
      router.push("/sign-in?redirect=/pricing");
      return;
    }

    setLoading(priceId);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl border-2 p-8 ${
                plan.popular
                  ? "border-red-500 shadow-lg scale-105"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">{plan.name}</h2>
                <p className="text-muted-foreground mt-1">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.popular
                    ? "bg-red-500 hover:bg-red-600"
                    : ""
                }`}
                variant={plan.priceId ? "default" : "outline"}
                disabled={!plan.priceId || loading === plan.priceId}
                onClick={() => handleSubscribe(plan.priceId)}
              >
                {loading === plan.priceId ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 text-muted-foreground">
          <p>All plans include a 14-day free trial. No credit card required.</p>
        </div>
      </main>
    </div>
  );
}
