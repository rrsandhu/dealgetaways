import Link from "next/link";
import type { Metadata } from "next";
import { Check, Crown, Zap, Bell, TrendingDown, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRICING_PLANS } from "@/lib/stripe";
import { getAllCities } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Premium — Unlock All Canadian Hotel Deals",
  description:
    "Subscribe to Premium to unlock all hotel deals for your favourite Canadian cities. Real-time alerts, price drops, and flash deals. From $9.99/month.",
};

export default async function PremiumPage({
  searchParams: searchParamsProp,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const searchParams = await searchParamsProp;
  const cities = await getAllCities().catch(() => []);
  const preselectedCity = cities.find((c) => c.slug === searchParams.city);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-800 to-blue-950 py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 flex justify-center">
            <Crown className="h-12 w-12 text-amber-400" />
          </div>
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            Premium Membership
          </h1>
          <p className="mt-4 text-lg text-blue-200">
            Unlock all hotel deals for Canadian cities you love.
            Real-time alerts. No more missed savings.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {/* Preselected city callout */}
        {preselectedCity && (
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <MapPin className="h-5 w-5 text-blue-700 shrink-0" />
            <p className="text-blue-900">
              You&apos;re subscribing to unlock{" "}
              <strong>{preselectedCity.name}</strong> deals.
            </p>
          </div>
        )}

        {/* Pricing cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm",
                plan.highlighted
                  ? "border-blue-600 ring-2 ring-blue-600 shadow-lg"
                  : "border-gray-200"
              )}
            >
              {plan.badge && (
                <div className="absolute right-4 top-4">
                  <Badge
                    className={cn(
                      "text-xs",
                      plan.highlighted
                        ? "bg-blue-600 text-white"
                        : "bg-amber-500 text-white"
                    )}
                  >
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{plan.description}</p>

              <div className="mt-4">
                {plan.price === 0 ? (
                  <span className="text-4xl font-black text-gray-900">Free</span>
                ) : (
                  <>
                    <span className="text-4xl font-black text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-gray-500">/{plan.period}</span>
                    {plan.pricePerMonth && (
                      <p className="mt-1 text-sm text-green-600 font-medium">
                        ${plan.pricePerMonth}/month equivalent
                      </p>
                    )}
                  </>
                )}
              </div>

              <ul className="mt-5 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        plan.highlighted ? "text-blue-600" : "text-green-500"
                      )}
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {plan.id === "free" ? (
                  <Link href="/sign-up">
                    <Button variant="outline" className="w-full">
                      Get Started Free
                    </Button>
                  </Link>
                ) : (
                  <form action="/api/stripe/checkout" method="POST">
                    <input type="hidden" name="priceId" value={plan.stripePriceId} />
                    {preselectedCity && (
                      <input type="hidden" name="cityId" value={preselectedCity.id} />
                    )}
                    <Button
                      type="submit"
                      className={cn(
                        "w-full",
                        plan.highlighted
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-gray-900 hover:bg-gray-800"
                      )}
                    >
                      <Crown className="h-4 w-4" />
                      Subscribe Now
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Feature highlights */}
        <div className="mt-16">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
            Everything in Premium
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: MapPin,
                title: "City Subscriptions",
                desc: "Subscribe to any of our 24 Canadian cities. See all current deals for that city.",
              },
              {
                icon: Zap,
                title: "Flash Deal Access",
                desc: "Expiring deals with the biggest discounts. Premium members see them first.",
              },
              {
                icon: Bell,
                title: "Real-time Alerts",
                desc: "Get email alerts when prices drop or new deals match your criteria.",
              },
              {
                icon: TrendingDown,
                title: "Price History",
                desc: "See price trends over time so you know if it's really a deal.",
              },
              {
                icon: Shield,
                title: "Unlimited Searches",
                desc: "No search limits. Find exactly what you're looking for.",
              },
              {
                icon: Crown,
                title: "Priority Support",
                desc: "Email support with faster response times for premium members.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <Icon className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "What does a city subscription give me?",
                a: "You get access to all hotel deals in that city — not just the 3 preview deals. You also get deal alerts when prices drop for hotels in your subscribed cities.",
              },
              {
                q: "Can I subscribe to multiple cities?",
                a: "Yes! Each subscription covers one city. You can subscribe to as many cities as you like.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes. Cancel anytime from your dashboard. You keep access until the end of your billing period.",
              },
              {
                q: "How often are deals updated?",
                a: "Deals are scraped and updated daily. Flash deals may appear and expire within hours.",
              },
            ].map(({ q, a }) => (
              <div
                key={q}
                className="rounded-2xl border border-gray-200 bg-white p-5"
              >
                <h3 className="font-semibold text-gray-900">{q}</h3>
                <p className="mt-2 text-sm text-gray-600">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
