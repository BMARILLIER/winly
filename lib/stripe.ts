import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  console.warn("[stripe] STRIPE_SECRET_KEY not set — Stripe features will be disabled.");
}

export const stripe = new Stripe(secretKey ?? "sk_test_placeholder", {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
  appInfo: {
    name: "Winly",
    version: "0.1.0",
  },
});

export const PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    price: 0,
    generationsLimit: 5,
    personasLimit: 1,
  },
  PRO: {
    id: "pro",
    name: "Pro",
    priceEur: 19,
    generationsLimit: Infinity,
    personasLimit: 3,
  },
} as const;

export type PlanId = "free" | "pro";
