import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchBar } from "@/components/search/search-bar";
import { SearchFilters } from "@/components/search/search-filters";
import { DealCard } from "@/components/hotel/deal-card";
import { Button } from "@/components/ui/button";
import { searchDeals } from "@/lib/supabase/queries";
import Link from "next/link";
import { Crown } from "lucide-react";

export const metadata: Metadata = {
  title: "Search Hotel Deals Across Canada",
  description:
    "Search all hotel deals across 24 Canadian cities. Filter by price, stars, and more.",
};

interface SearchPageProps {
  searchParams: Promise<{
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    minPrice?: string;
    maxPrice?: string;
    minStars?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams: searchParamsProp }: SearchPageProps) {
  const searchParams = await searchParamsProp;
  const page = Number(searchParams.page ?? 1);

  const { deals, total } = await searchDeals({
    destination: searchParams.destination,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    minStars: searchParams.minStars ? Number(searchParams.minStars) : undefined,
    sortBy: searchParams.sortBy as "best_deals" | "price_asc" | "top_rated",
    page,
    limit: 20,
  }).catch(() => ({ deals: [], total: 0 }));

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search bar */}
      <div className="border-b border-gray-200 bg-white py-4 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SearchBar
            variant="compact"
            initialValues={{
              destination: searchParams.destination,
              checkIn: searchParams.checkIn,
              checkOut: searchParams.checkOut,
              guests: searchParams.guests ? Number(searchParams.guests) : 2,
            }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Filters sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-20 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <Suspense>
                <SearchFilters />
              </Suspense>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {searchParams.destination
                    ? `Hotels in ${searchParams.destination}`
                    : "All Canadian Hotel Deals"}
                </h1>
                <p className="text-sm text-gray-500">
                  {total} deals found
                </p>
              </div>
            </div>

            {deals.length > 0 ? (
              <div className="space-y-4">
                {deals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    hotel={deal.hotel}
                    variant="list"
                    isBlurred={false}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-20 text-center">
                <p className="text-gray-500">No deals found.</p>
                <p className="mt-1 text-sm text-gray-400">
                  Try adjusting your search or filters.
                </p>
                <Link href="/search" className="mt-4">
                  <Button variant="outline">Clear filters</Button>
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/search?${new URLSearchParams({
                      ...searchParams,
                      page: String(page - 1),
                    })}`}
                  >
                    <Button variant="outline">← Prev</Button>
                  </Link>
                )}
                <span className="flex items-center px-4 text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/search?${new URLSearchParams({
                      ...searchParams,
                      page: String(page + 1),
                    })}`}
                  >
                    <Button variant="outline">Next →</Button>
                  </Link>
                )}
              </div>
            )}

            {/* Premium upsell */}
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <Crown className="h-8 w-8 shrink-0 text-blue-700" />
              <div className="flex-1">
                <p className="font-semibold text-blue-900">
                  Subscribe to cities for full deal access
                </p>
                <p className="text-sm text-blue-700">
                  Get real-time alerts and unlock all deals for your favourite
                  cities.
                </p>
              </div>
              <Link href="/premium">
                <Button className="shrink-0 bg-blue-700 hover:bg-blue-800">
                  Upgrade
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
