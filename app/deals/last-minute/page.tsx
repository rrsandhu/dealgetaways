import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { DealCard } from "@/components/hotel/deal-card";
import { getLastMinuteDeals } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Last Minute Hotel Deals — Book This Week",
  description:
    "Last minute hotel deals across Canada. Check-in within 7 days. Best prices available now.",
};

export default async function LastMinutePage() {
  const deals = await getLastMinuteDeals(40).catch(() => []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-red-600 to-rose-700 py-12 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Clock className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white sm:text-4xl">
            Last Minute Deals
          </h1>
          <p className="mt-2 text-red-100">
            Check in within 7 days — {deals.length} deals available
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {deals.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                hotel={deal.hotel}
                isBlurred={false}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Clock className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No last minute deals right now.</p>
            <p className="mt-1 text-sm text-gray-400">
              Last minute deals are deals with check-in within 7 days.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
