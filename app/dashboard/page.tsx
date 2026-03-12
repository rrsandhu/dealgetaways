import Link from "next/link";
import type { Metadata } from "next";
import {
  Crown,
  Bell,
  BookmarkCheck,
  MapPin,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getUserSubscriptions,
  getAllCities,
} from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  // Auth disabled — replace with Clerk when keys are available
  const clerkUser: { firstName?: string | null } | null = null;
  const dbUser = null;
  const subscriptions: Awaited<ReturnType<typeof getUserSubscriptions>> = [];
  const cities: Awaited<ReturnType<typeof getAllCities>> = [];

  const subscribedCities = cities.filter((c) =>
    subscriptions.some((s) => s.city_id === c.id)
  );
  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "active"
  );
  const isPremium = activeSubscriptions.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">
              Welcome back, {clerkUser?.firstName ?? "there"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isPremium ? (
              <Badge className="bg-blue-600 text-white px-3 py-1">
                <Crown className="mr-1 h-3.5 w-3.5" />
                Premium
              </Badge>
            ) : (
              <Badge variant="secondary">Free</Badge>
            )}
          </div>
        </div>

        {/* No DB user warning */}
        {!dbUser && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                Account setup incomplete
              </p>
              <p className="text-sm text-amber-700">
                Your Supabase database isn&apos;t connected yet. Connect Supabase
                to enable subscriptions and alerts.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Subscriptions card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-blue-700" />
                <h2 className="font-semibold text-gray-900">
                  City Subscriptions
                </h2>
              </div>
              <Link href="/premium">
                <Button size="sm" variant="outline">
                  Add city
                </Button>
              </Link>
            </div>

            {subscribedCities.length > 0 ? (
              <ul className="space-y-2">
                {subscribedCities.map((city) => (
                  <li
                    key={city.id}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {city.name}
                      </span>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Active
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <Crown className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No city subscriptions</p>
                <Link href="/premium" className="mt-3 block">
                  <Button size="sm" className="bg-blue-700 hover:bg-blue-800">
                    Subscribe to a city
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Alerts card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-700" />
                <h2 className="font-semibold text-gray-900">Deal Alerts</h2>
              </div>
              <Link href="/alerts">
                <Button size="sm" variant="outline">
                  Manage
                </Button>
              </Link>
            </div>

            {isPremium ? (
              <div className="text-center py-6">
                <Bell className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No alerts set up yet</p>
                <Link href="/alerts" className="mt-3 block">
                  <Button size="sm" variant="outline">
                    Create alert
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <Bell className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">
                  Alerts require Premium
                </p>
                <Link href="/premium" className="mt-3 block">
                  <Button size="sm" className="bg-blue-700 hover:bg-blue-800">
                    Upgrade
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Saved searches card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="h-5 w-5 text-blue-700" />
                <h2 className="font-semibold text-gray-900">Saved Searches</h2>
              </div>
              <Link href="/saved-searches">
                <Button size="sm" variant="outline">
                  View all
                </Button>
              </Link>
            </div>
            <div className="text-center py-6">
              <BookmarkCheck className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No saved searches</p>
              <Link href="/search" className="mt-3 block">
                <Button size="sm" variant="outline">
                  Browse deals
                </Button>
              </Link>
            </div>
          </div>

          {/* Billing card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-700" />
              <h2 className="font-semibold text-gray-900">Billing</h2>
            </div>

            {isPremium ? (
              <div>
                <p className="text-sm text-gray-600">
                  {activeSubscriptions.length} active subscription
                  {activeSubscriptions.length > 1 ? "s" : ""}
                </p>
                <form action="/api/stripe/portal" method="POST" className="mt-4">
                  <Button type="submit" variant="outline" className="w-full">
                    Manage Billing
                  </Button>
                </form>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-3">
                  No active subscriptions
                </p>
                <Link href="/premium">
                  <Button className="w-full bg-blue-700 hover:bg-blue-800">
                    <Crown className="h-4 w-4" />
                    Upgrade to Premium
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
