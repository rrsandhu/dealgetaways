"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DealCard } from "@/components/hotel/deal-card";
import type { DbDeal, DbHotel, DbCity } from "@/types";

type TopDeal = DbDeal & { hotel: DbHotel & { city?: DbCity } };

interface TrendingDealsSectionProps {
  deals: TopDeal[];
}

export function TrendingDealsSection({ deals }: TrendingDealsSectionProps) {
  const [selectedCity, setSelectedCity] = useState("all");

  // Build unique city list ordered by deal count
  const cityMap = new Map<string, { slug: string; name: string; count: number }>();
  for (const deal of deals) {
    const city = deal.hotel.city;
    if (!city) continue;
    const entry = cityMap.get(city.slug);
    if (entry) entry.count++;
    else cityMap.set(city.slug, { slug: city.slug, name: city.name, count: 1 });
  }
  const cities = Array.from(cityMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  const filtered =
    selectedCity === "all"
      ? deals.slice(0, 8)
      : deals.filter((d) => d.hotel.city?.slug === selectedCity).slice(0, 8);

  return (
    <section className="py-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trending Deals Right Now</h2>
          <p className="text-sm text-gray-500 mt-0.5">Highest savings across Canada today</p>
        </div>
        <Link
          href={`/search?sortBy=best_deals${selectedCity !== "all" ? `&destination=${selectedCity}` : ""}`}
          className="hidden sm:flex items-center gap-1 text-sm font-semibold hover:underline shrink-0"
          style={{ color: "#2F7C9C" }}
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* City filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide -mx-1 px-1">
        <button
          onClick={() => setSelectedCity("all")}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            selectedCity === "all"
              ? "text-white shadow-sm"
              : "border border-gray-200 bg-white text-gray-600 hover:border-[#2F7C9C] hover:text-[#2F7C9C]"
          }`}
          style={selectedCity === "all" ? { backgroundColor: "#2F7C9C" } : {}}
        >
          All Canada
        </button>
        {cities.map((city) => (
          <button
            key={city.slug}
            onClick={() => setSelectedCity(city.slug)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              selectedCity === city.slug
                ? "text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:border-[#2F7C9C] hover:text-[#2F7C9C]"
            }`}
            style={selectedCity === city.slug ? { backgroundColor: "#2F7C9C" } : {}}
          >
            {city.name}
          </button>
        ))}
      </div>

      {/* Deal cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((deal) => (
            <DealCard key={deal.id} deal={deal} hotel={deal.hotel} isBlurred={false} />
          ))}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 text-gray-400 text-sm">
          No active deals for this city right now — check back soon.
        </div>
      )}

      <div className="mt-4 flex sm:hidden">
        <Link
          href={`/search?sortBy=best_deals${selectedCity !== "all" ? `&destination=${selectedCity}` : ""}`}
          className="flex items-center gap-1 text-sm font-semibold hover:underline"
          style={{ color: "#2F7C9C" }}
        >
          View all deals <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
