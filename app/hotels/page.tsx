import type { Metadata } from "next";
import { HotelSearchForm } from "@/components/booking/hotel-search-form";
import { HotelResultsClient } from "@/components/booking/hotel-results-client";

export const metadata: Metadata = {
  title: "Search Hotels — Live Rates",
  description: "Search hotels by destination or describe your perfect trip. Live rates powered by LiteAPI.",
};

interface PageProps {
  searchParams: Promise<{
    placeId?: string;
    destination?: string;
    aiSearch?: string;
    checkin?: string;
    checkout?: string;
    adults?: string;
  }>;
}

export default async function HotelsPage({ searchParams: searchParamsProp }: PageProps) {
  const sp = await searchParamsProp;
  const hasSearch = !!(sp.placeId || sp.aiSearch);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search header */}
      <div className="bg-gradient-to-br from-slate-800 to-[#1f5a73] py-8 px-4">
        <div className="mx-auto max-w-5xl">
          <HotelSearchForm
            variant="compact"
            initialValues={{
              mode: sp.aiSearch ? "vibe" : "destination",
              placeId: sp.placeId,
              destination: sp.destination,
              aiSearch: sp.aiSearch,
              checkin: sp.checkin,
              checkout: sp.checkout,
              adults: sp.adults ? Number(sp.adults) : 2,
            }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {!hasSearch ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🏨</div>
            <h2 className="text-xl font-bold text-gray-800">Where do you want to go?</h2>
            <p className="text-gray-500 mt-2 max-w-sm">
              Search by destination or describe your perfect trip above to see live hotel rates.
            </p>
          </div>
        ) : (
          <HotelResultsClient
            placeId={sp.placeId}
            destination={sp.destination}
            aiSearch={sp.aiSearch}
            checkin={sp.checkin ?? ""}
            checkout={sp.checkout ?? ""}
            adults={sp.adults ? Number(sp.adults) : 2}
          />
        )}
      </div>
    </div>
  );
}
