import type { Metadata } from "next";
import { Zap } from "lucide-react";
import { DealCard } from "@/components/hotel/deal-card";
import { getFlashDeals } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Flash Hotel Deals — Limited Time Offers Across Canada",
  description:
    "Flash hotel deals expiring soon. Save up to 50% on top Canadian hotels. Book before they're gone.",
};

export default async function FlashDealsPage() {
  const deals = await getFlashDeals(40).catch(() => []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-orange-500 to-red-600 py-12 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Zap className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white sm:text-4xl">
            Flash Deals
          </h1>
          <p className="mt-2 text-orange-100">
            {deals.length} deals expiring soon — book before they&apos;re gone
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
            <Zap className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No flash deals active right now.</p>
            <p className="mt-1 text-sm text-gray-400">Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
