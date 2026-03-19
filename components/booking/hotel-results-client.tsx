"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  MapPin,
  Sparkles,
  Loader2,
  ShieldCheck,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import type { HotelRateResult } from "@/lib/liteapi-server";

interface Props {
  placeId?: string;
  destination?: string;
  aiSearch?: string;
  checkin: string;
  checkout: string;
  adults: number;
}

function calcNights(checkin: string, checkout: string) {
  if (!checkin || !checkout) return 1;
  return Math.max(
    1,
    Math.round(
      (new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000
    )
  );
}

function fmtDate(d: string) {
  if (!d) return "";
  return new Date(d + "T12:00:00").toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
}

function fmtPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function ratingLabel(rating: number): { label: string; color: string } {
  if (rating >= 9.0) return { label: "Exceptional", color: "bg-green-600" };
  if (rating >= 8.5) return { label: "Excellent", color: "bg-green-500" };
  if (rating >= 8.0) return { label: "Very Good", color: "bg-blue-600" };
  if (rating >= 7.0) return { label: "Good", color: "bg-blue-500" };
  return { label: "Okay", color: "bg-gray-500" };
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col sm:flex-row animate-pulse">
      <div className="w-full sm:w-64 md:w-72 shrink-0 aspect-[4/3] sm:aspect-auto sm:h-52 bg-gray-200" />
      <div className="flex-1 p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="mt-auto pt-4 flex items-end justify-between">
          <div className="space-y-1">
            <div className="h-6 bg-gray-200 rounded w-24" />
            <div className="h-3 bg-gray-100 rounded w-16" />
          </div>
          <div className="h-9 bg-gray-200 rounded-xl w-28" />
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function HotelResultsClient({
  placeId,
  destination,
  aiSearch,
  checkin,
  checkout,
  adults,
}: Props) {
  const [hotels, setHotels] = useState<HotelRateResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"price" | "rating">("price");
  const [starFilter, setStarFilter] = useState<number>(0); // 0 = any
  const [showFilters, setShowFilters] = useState(false);
  const isAI = !!aiSearch;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setHotels([]);
      try {
        const res = await fetch("/api/liteapi/rates", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            placeId,
            aiSearch,
            checkin,
            checkout,
            adults,
            maxRatesPerHotel: 1,
          }),
        });
        if (!res.ok) throw new Error("Failed to fetch rates");
        const data = await res.json();
        if (!cancelled) setHotels(data.results ?? []);
      } catch (e) {
        if (!cancelled) setError("Could not load hotels. Please try again.");
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [placeId, aiSearch, checkin, checkout, adults]);

  const n = calcNights(checkin, checkout);

  const filtered = useMemo(() => {
    let list = [...hotels];
    if (starFilter > 0) {
      list = list.filter((h) => (h.starRating ?? 0) >= starFilter);
    }
    list.sort((a, b) => {
      if (sortBy === "rating") {
        return (b.rating ?? 0) - (a.rating ?? 0);
      }
      // price
      const pa = a.roomTypes?.[0]?.rates?.[0]?.retailRate?.total?.[0]?.amount ?? Infinity;
      const pb = b.roomTypes?.[0]?.rates?.[0]?.retailRate?.total?.[0]?.amount ?? Infinity;
      return pa - pb;
    });
    return list;
  }, [hotels, sortBy, starFilter]);

  const searchLabel = aiSearch
    ? `Results for "${aiSearch}"`
    : destination
    ? `Hotels in ${destination}`
    : "Hotel Results";

  return (
    <div>
      {/* ── Search summary + filter bar ── */}
      <div className="mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {isAI && <Sparkles className="h-5 w-5 text-purple-500 shrink-0" />}
              {loading ? "Searching…" : searchLabel}
            </h1>
            {!loading && (
              <p className="text-sm text-gray-500 mt-0.5">
                {filtered.length} {filtered.length === 1 ? "hotel" : "hotels"}
                {checkin && checkout && (
                  <>
                    {" · "}
                    {fmtDate(checkin)} – {fmtDate(checkout)}
                    {" · "}
                    {n} {n === 1 ? "night" : "nights"}
                  </>
                )}
                {" · "}
                {adults} {adults === 1 ? "adult" : "adults"}
              </p>
            )}
          </div>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sort</span>
              {(["price", "rating"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    sortBy === opt
                      ? "bg-[#2F7C9C] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt === "price" ? "Lowest Price" : "Highest Rated"}
                </button>
              ))}
            </div>

            <div className="h-5 w-px bg-gray-200 hidden sm:block" />

            {/* Stars */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Stars</span>
              {[0, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setStarFilter(s)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    starFilter === s
                      ? "bg-[#2F7C9C] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s === 0 ? "Any" : `${s}+★`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── States ── */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center py-20 text-center gap-3">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center gap-3">
          <div className="text-4xl">😕</div>
          <p className="font-semibold text-gray-700">No hotels found</p>
          <p className="text-sm text-gray-500">
            Try different dates, a different destination, or adjust your filters.
          </p>
        </div>
      )}

      {/* ── Hotel cards ── */}
      {!loading && !error && (
        <div className="space-y-4">
          {filtered.map((hotel) => {
            const minRate = hotel.roomTypes?.[0]?.rates?.[0];
            const price = minRate?.retailRate?.total?.[0]?.amount;
            const currency = minRate?.retailRate?.total?.[0]?.currency ?? "CAD";
            const isRefundable = minRate?.cancellationPolicies?.refundableTag === "RFN";
            const totalPrice = price != null ? price * n : null;
            return (
              <HotelCard
                key={hotel.hotelId}
                hotel={hotel}
                checkin={checkin}
                checkout={checkout}
                adults={adults}
                price={price}
                totalPrice={totalPrice}
                currency={currency}
                isRefundable={isRefundable}
                nights={n}
                isAI={isAI}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Hotel Card ────────────────────────────────────────────────────────────────
interface CardProps {
  hotel: HotelRateResult;
  checkin: string;
  checkout: string;
  adults: number;
  price?: number;
  totalPrice: number | null;
  currency: string;
  isRefundable: boolean;
  nights: number;
  isAI: boolean;
}

function HotelCard({
  hotel,
  checkin,
  checkout,
  adults,
  price,
  totalPrice,
  currency,
  isRefundable,
  nights,
  isAI,
}: CardProps) {
  const detailUrl = `/hotel/${hotel.hotelId}?checkin=${checkin}&checkout=${checkout}&adults=${adults}`;
  const rating = hotel.rating;
  const rLabel = rating ? ratingLabel(rating) : null;

  return (
    <Link href={detailUrl} className="block group">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-64 md:w-72 shrink-0 aspect-[4/3] sm:aspect-auto sm:min-h-[200px] bg-gray-100">
          {hotel.main_photo ? (
            <Image
              src={hotel.main_photo}
              alt={hotel.name ?? "Hotel"}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, 288px"
            />
          ) : (
            <div className="h-full w-full min-h-[200px] flex items-center justify-center bg-gradient-to-br from-[#e8f4fa] to-[#6FAFD0]/30">
              <MapPin className="h-12 w-12 text-[#2F7C9C]/30" />
            </div>
          )}
          {/* AI badge */}
          {isAI && hotel.tags && hotel.tags.length > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-purple-600 px-2 py-0.5">
              <Sparkles className="h-3 w-3 text-white" />
              <span className="text-[10px] font-bold text-white">AI Pick</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between gap-3 min-w-0">
          {/* Top: name, location, stars */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-gray-900 text-base leading-tight group-hover:text-[#2F7C9C] transition-colors line-clamp-2">
                  {hotel.name ?? hotel.hotelId}
                </h2>
                {hotel.address && (
                  <p className="mt-0.5 text-xs text-gray-500 flex items-center gap-1 line-clamp-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {hotel.address}
                  </p>
                )}
              </div>

              {/* Guest rating badge */}
              {rLabel && rating && (
                <div className="shrink-0 flex flex-col items-end gap-0.5">
                  <div className={`${rLabel.color} text-white text-xs font-bold rounded-lg px-2 py-0.5`}>
                    {rLabel.label}
                  </div>
                  <span className="text-xs text-gray-500 font-semibold">{rating.toFixed(1)} / 10</span>
                </div>
              )}
            </div>

            {/* Star rating */}
            {hotel.starRating && hotel.starRating > 0 && (
              <div className="mt-1.5 flex items-center gap-0.5">
                {Array.from({ length: Math.min(5, hotel.starRating) }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1 text-xs text-gray-400">{hotel.starRating}-star hotel</span>
              </div>
            )}

            {/* AI story */}
            {isAI && hotel.story && (
              <p className="mt-2 text-xs text-gray-600 line-clamp-2 italic">"{hotel.story}"</p>
            )}

            {/* AI tags */}
            {isAI && hotel.tags && hotel.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {hotel.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] bg-purple-50 text-purple-700 border border-purple-100 rounded-full px-2 py-0.5 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bottom: refundable + price + CTA */}
          <div className="flex items-end justify-between gap-4 flex-wrap pt-1">
            <div>
              {isRefundable && (
                <p className="text-xs text-green-600 font-medium flex items-center gap-1 mb-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Free cancellation
                </p>
              )}
              {price != null ? (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-900">
                      {fmtPrice(price, currency)}
                    </span>
                    <span className="text-sm text-gray-500">/night</span>
                  </div>
                  {nights > 1 && totalPrice != null && (
                    <p className="text-xs text-gray-400">
                      {fmtPrice(totalPrice, currency)} total for {nights} nights
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400">Prices unavailable</p>
              )}
            </div>

            <button
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-white bg-[#E76D38] hover:bg-[#c45a2a] transition-colors shrink-0 shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = detailUrl;
              }}
            >
              See Rooms
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
