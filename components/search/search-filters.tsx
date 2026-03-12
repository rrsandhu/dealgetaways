"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 800]);
  const [minStars, setMinStars] = useState(0);
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") ?? "best_deals"
  );

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < 800) params.set("maxPrice", priceRange[1].toString());
    if (minStars > 0) params.set("minStars", minStars.toString());
    params.set("sortBy", sortBy);
    router.push(`/search?${params.toString()}`);
  }, [priceRange, minStars, sortBy, searchParams, router]);

  const clearFilters = useCallback(() => {
    setPriceRange([0, 800]);
    setMinStars(0);
    setSortBy("best_deals");
    const base = searchParams.get("destination")
      ? `?destination=${searchParams.get("destination")}`
      : "";
    router.push(`/search${base}`);
  }, [searchParams, router]);

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <button
          onClick={clearFilters}
          className="text-xs text-blue-600 hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-800">Sort by</h4>
        <div className="space-y-1">
          {[
            { value: "best_deals", label: "Best Deals" },
            { value: "price_asc", label: "Price: Low to High" },
            { value: "top_rated", label: "Top Rated" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                sortBy === opt.value
                  ? "bg-blue-50 font-medium text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-800">Price per night</h4>
        <Slider
          min={0}
          max={800}
          step={25}
          value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])}
        />
        <div className="flex justify-between text-sm text-gray-600">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}{priceRange[1] === 800 ? "+" : ""}</span>
        </div>
      </div>

      {/* Stars */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-800">Minimum stars</h4>
        <div className="flex flex-wrap gap-2">
          {[0, 3, 4, 5].map((stars) => (
            <button
              key={stars}
              onClick={() => setMinStars(stars)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                minStars === stars
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              {stars === 0 ? "Any" : `${stars}★+`}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={applyFilters} className="w-full bg-blue-600 hover:bg-blue-700">
        Apply Filters
      </Button>
    </aside>
  );
}
