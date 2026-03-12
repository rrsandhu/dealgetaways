import Stripe from "stripe";
import type { PricingPlan } from "@/types";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Browse a preview of deals across Canada",
    features: [
      "3 blurred deals per city (preview)",
      "Basic city search",
      "View all 24 Canadian cities",
      "No credit card required",
    ],
    highlighted: false,
    stripePriceId: "",
  },
  {
    id: "premium_monthly",
    name: "Premium Monthly",
    price: 9.99,
    period: "month",
    description: "Full access to all deals for your subscribed cities",
    features: [
      "Unlimited deals for subscribed cities",
      "Real-time deal alerts via email",
      "Saved searches",
      "Price drop notifications",
      "Flash deals access",
      "Last minute deals",
      "Booking link with best price",
      "Cancel anytime",
    ],
    highlighted: true,
    stripePriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID ?? "",
    badge: "Most Popular",
  },
  {
    id: "premium_annual",
    name: "Premium Annual",
    price: 99,
    pricePerMonth: 8.25,
    period: "year",
    description: "Best value — save 17% vs monthly",
    features: [
      "Everything in Premium Monthly",
      "Save 17% vs monthly billing",
      "Priority email support",
      "Early access to new city deals",
    ],
    highlighted: false,
    stripePriceId: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID ?? "",
    badge: "Best Value",
  },
];

export async function createCheckoutSession({
  customerId,
  priceId,
  userId,
  cityId,
  successUrl,
  cancelUrl,
  utmParams,
}: {
  customerId?: string;
  priceId: string;
  userId: string;
  cityId?: string;
  successUrl: string;
  cancelUrl: string;
  utmParams?: Record<string, string>;
}) {
  return stripe.checkout.sessions.create({
    ...(customerId ? { customer: customerId } : {}),
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      ...(cityId ? { cityId } : {}),
      ...(utmParams ?? {}),
    },
    subscription_data: {
      metadata: {
        userId,
        ...(cityId ? { cityId } : {}),
      },
    },
    allow_promotion_codes: true,
  });
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function getOrCreateStripeCustomer(
  email: string,
  name?: string
): Promise<string> {
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) return existing.data[0].id;
  const customer = await stripe.customers.create({ email, name });
  return customer.id;
}
