import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { Bell, Crown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  getUserByClerkId,
  getUserSubscriptions,
  getAllCities,
} from "@/lib/supabase/queries";

export const metadata: Metadata = { title: "Deal Alerts" };

export default async function AlertsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await getUserByClerkId(userId);
  const subscriptions = dbUser ? await getUserSubscriptions(dbUser.id) : [];
  const isPremium = subscriptions.some((s) => s.status === "active");
  const cities = await getAllCities().catch(() => []);

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
          <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Deal Alerts</h1>
          <p className="mt-2 text-gray-600">
            Get email notifications when new deals match your criteria. Requires Premium.
          </p>
          <Link href="/premium" className="mt-6 inline-block">
            <Button className="bg-blue-700 hover:bg-blue-800" size="lg">
              <Crown className="h-4 w-4" />
              Upgrade to Premium
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Deal Alerts</h1>
          <p className="text-gray-500">Get notified when deals match your criteria</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
          <h2 className="mb-4 font-semibold text-gray-900">Create New Alert</h2>
          <form action="/api/alerts" method="POST" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alert name
              </label>
              <input
                name="name"
                type="text"
                placeholder='e.g. "Toronto under $200"'
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select
                  name="citySlug"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any city</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.slug}>{city.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max price per night
                </label>
                <input
                  name="maxPrice"
                  type="number"
                  placeholder="e.g. 250"
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum star rating
              </label>
              <select
                name="minStars"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any rating</option>
                <option value="3">3★+</option>
                <option value="4">4★+</option>
                <option value="5">5★ only</option>
              </select>
            </div>

            <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800">
              <Plus className="h-4 w-4" />
              Create Alert
            </Button>
          </form>
        </div>

        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <Bell className="mx-auto h-8 w-8 text-gray-300 mb-3" />
          <p className="text-gray-500">No alerts yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Create an alert above to get notified when deals match your criteria.
          </p>
        </div>
      </div>
    </div>
  );
}
