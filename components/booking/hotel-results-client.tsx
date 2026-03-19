"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Star,
  MapPin,
  Sparkles,
  Loader2,
  ShieldCheck,
  List,
  Map as MapIcon,
  X,
  SlidersHorizontal,
} from "lucide-react";
import type { HotelRateResult } from "@/lib/liteapi-server";

const LiteAPIMapWidget = dynamic(
  () => import("@/components/liteapi/map-widget").then((m) => m.LiteAPIMapWidget),
  { ssr: false }
);

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
  return Math.max(1, Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000));
}

function fmtDate(d: string) {
  if (!d) return "";
  return new Date(d + "T12:00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

function fmtPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function ratingLabel(r: number): { label: string; color: string } {
  if (r >= 9) return { label: "Exceptional", color: "bg-green-600" };
  if (r >= 8.5) return { label: "Excellent", color: "bg-green-500" };
  if (r >= 8) return { label: "Very Good", color: "bg-blue-600" };
  if (r >= 7) return { label: "Good", color: "bg-blue-500" };
  return { label: "Okay", color: "bg-gray-500" };
}

function getPrice(hotel: HotelRateResult) {
  return hotel.roomTypes?.[0]?.rates?.[0]?.retailRate?.total?.[0]?.amount ?? null;
}

function getCurrency(hotel: HotelRateResult) {
  return hotel.roomTypes?.[0]?.rates?.[0]?.retailRate?.total?.[0]?.currency ?? "CAD";
}

function isRefundable(hotel: HotelRateResult) {
  return hotel.roomTypes?.[0]?.rates?.[0]?.cancellationPolicies?.refundableTag === "RFN";
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col sm:flex-row animate-pulse">
      <div className="w-full sm:w-56 shrink-0 aspect-[4/3] sm:aspect-auto sm:h-48 bg-gray-200" />
      <div className="flex-1 p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="mt-auto pt-6 flex justify-between">
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

// ── Filter sidebar ────────────────────────────────────────────────────────────
interface FilterState {
  sortBy: "price" | "rating" | "reviews";
  stars: number[];
  minRating: number;
  maxPrice: number;
  refundableOnly: boolean;
}

const defaultFilters: FilterState = {
  sortBy: "price",
  stars: [],
  minRating: 0,
  maxPrice: 0,
  refundableOnly: false,
};

interface SidebarProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  maxPriceInData: number;
  currency: string;
  onClose?: () => void;
}

function FilterSidebar({ filters, onChange, maxPriceInData, currency, onClose }: SidebarProps) {
  function toggleStar(s: number) {
    const next = filters.stars.includes(s)
      ? filters.stars.filter((x) => x !== s)
      : [...filters.stars, s];
    onChange({ ...filters, stars: next });
  }

  const priceBuckets = useMemo(() => {
    if (maxPriceInData <= 0) return [];
    const step = Math.ceil(maxPriceInData / 4 / 50) * 50;
    return [
      { label: `Under ${fmtPrice(step, currency)}`, max: step },
      { label: `${fmtPrice(step, currency)} – ${fmtPrice(step * 2, currency)}`, max: step * 2 },
      { label: `${fmtPrice(step * 2, currency)} – ${fmtPrice(step * 3, currency)}`, max: step * 3 },
      { label: `${fmtPrice(step * 3, currency)}+`, max: 0 },
    ];
  }, [maxPriceInData, currency]);

  return (
    <div className="space-y-5 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-900 text-base">Filters</span>
        <div className="flex items-center gap-2">
          <button onClick={() => onChange(defaultFilters)} className="text-xs text-[#2F7C9C] hover:underline">
            Clear all
          </button>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1 rounded-full hover:bg-gray-100">
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Sort */}
      <div>
        <p className="font-semibold text-gray-700 mb-2">Sort by</p>
        <div className="space-y-2">
          {(["price", "rating", "reviews"] as const).map((opt) => (
            <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="sortBy"
                checked={filters.sortBy === opt}
                onChange={() => onChange({ ...filters, sortBy: opt })}
                className="accent-[#2F7C9C] w-4 h-4"
              />
              <span className={`text-sm ${filters.sortBy === opt ? "font-semibold text-[#2F7C9C]" : "text-gray-600 group-hover:text-gray-900"}`}>
                {opt === "price" ? "Lowest price" : opt === "rating" ? "Guest rating" : "Most reviewed"}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Price per night */}
      {priceBuckets.length > 0 && (
        <>
          <div>
            <p className="font-semibold text-gray-700 mb-2">Price per night</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="maxPrice"
                  checked={filters.maxPrice === 0}
                  onChange={() => onChange({ ...filters, maxPrice: 0 })}
                  className="accent-[#2F7C9C] w-4 h-4"
                />
                <span className={`text-sm ${filters.maxPrice === 0 ? "font-semibold text-[#2F7C9C]" : "text-gray-600 group-hover:text-gray-900"}`}>Any price</span>
              </label>
              {priceBuckets.map((b) => (
                <label key={b.label} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="maxPrice"
                    checked={filters.maxPrice === b.max && b.max > 0}
                    onChange={() => onChange({ ...filters, maxPrice: b.max })}
                    className="accent-[#2F7C9C] w-4 h-4"
                  />
                  <span className={`text-sm ${filters.maxPrice === b.max && b.max > 0 ? "font-semibold text-[#2F7C9C]" : "text-gray-600 group-hover:text-gray-900"}`}>{b.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="h-px bg-gray-100" />
        </>
      )}

      {/* Star rating */}
      <div>
        <p className="font-semibold text-gray-700 mb-2">Star rating</p>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((s) => (
            <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.stars.includes(s)}
                onChange={() => toggleStar(s)}
                className="accent-[#2F7C9C] w-4 h-4 rounded"
              />
              <span className="flex items-center gap-0.5">
                {Array.from({ length: s }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
                {Array.from({ length: 5 - s }).map((_, i) => (
                  <Star key={`e${i}`} className="h-3 w-3 fill-gray-200 text-gray-200" />
                ))}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Guest rating */}
      <div>
        <p className="font-semibold text-gray-700 mb-2">Guest rating</p>
        <div className="space-y-2">
          {[
            { val: 9, label: "9+ Exceptional" },
            { val: 8, label: "8+ Excellent" },
            { val: 7, label: "7+ Good" },
            { val: 0, label: "Any" },
          ].map(({ val, label }) => (
            <label key={val} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="minRating"
                checked={filters.minRating === val}
                onChange={() => onChange({ ...filters, minRating: val })}
                className="accent-[#2F7C9C] w-4 h-4"
              />
              <span className={`text-sm ${filters.minRating === val ? "font-semibold text-[#2F7C9C]" : "text-gray-600 group-hover:text-gray-900"}`}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Free cancellation */}
      <label className="flex items-center gap-2.5 cursor-pointer group">
        <input
          type="checkbox"
          checked={filters.refundableOnly}
          onChange={(e) => onChange({ ...filters, refundableOnly: e.target.checked })}
          className="accent-[#2F7C9C] w-4 h-4 rounded"
        />
        <span className={`text-sm font-medium ${filters.refundableOnly ? "text-[#2F7C9C]" : "text-gray-700 group-hover:text-gray-900"}`}>
          Free cancellation only
        </span>
      </label>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function HotelResultsClient({ placeId, destination, aiSearch, checkin, checkout, adults }: Props) {
  const [hotels, setHotels] = useState<HotelRateResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "map">("list");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const isAI = !!aiSearch;
  const n = calcNights(checkin, checkout);

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
          body: JSON.stringify({ placeId, aiSearch, checkin, checkout, adults, maxRatesPerHotel: 1 }),
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

  const maxPriceInData = useMemo(() => {
    const prices = hotels.map((h) => getPrice(h)).filter((p): p is number => p !== null);
    return prices.length ? Math.max(...prices) : 0;
  }, [hotels]);

  const currency = hotels.length > 0 ? getCurrency(hotels[0]) : "CAD";

  const filtered = useMemo(() => {
    let list = [...hotels];
    if (filters.stars.length > 0) {
      list = list.filter((h) => filters.stars.includes(Math.round(h.starRating ?? 0)));
    }
    if (filters.minRating > 0) {
      list = list.filter((h) => (h.rating ?? 0) >= filters.minRating);
    }
    if (filters.maxPrice > 0) {
      list = list.filter((h) => { const p = getPrice(h); return p !== null && p <= filters.maxPrice; });
    }
    if (filters.refundableOnly) {
      list = list.filter((h) => isRefundable(h));
    }
    list.sort((a, b) => {
      if (filters.sortBy === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
      const pa = getPrice(a) ?? Infinity;
      const pb = getPrice(b) ?? Infinity;
      return pa - pb;
    });
    return list;
  }, [hotels, filters]);

  const handleFilterChange = useCallback((f: FilterState) => setFilters(f), []);
  const searchLabel = aiSearch ? `Results for "${aiSearch}"` : destination ? `Hotels in ${destination}` : "Hotel Results";

  return (
    <div className="flex gap-6 items-start">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-24 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <FilterSidebar
          filters={filters}
          onChange={handleFilterChange}
          maxPriceInData={maxPriceInData}
          currency={currency}
        />
      </aside>

      {/* ── Mobile filter drawer ── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-xl overflow-y-auto p-5">
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              maxPriceInData={maxPriceInData}
              currency={currency}
              onClose={() => setShowMobileFilters(false)}
            />
          </div>
        </div>
      )}

      {/* ── Results area ── */}
      <div className="flex-1 min-w-0">
        {/* Header bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {isAI && <Sparkles className="h-5 w-5 text-purple-500 shrink-0" />}
              {loading ? "Searching…" : searchLabel}
            </h1>
            {!loading && (
              <p className="text-sm text-gray-500 mt-0.5">
                {filtered.length} {filtered.length === 1 ? "property" : "properties"}
                {checkin && checkout && <> · {fmtDate(checkin)} – {fmtDate(checkout)} · {n} {n === 1 ? "night" : "nights"}</>}
                {" · "}{adults} {adults === 1 ? "adult" : "adults"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
            <div className="flex rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${view === "list" ? "bg-[#2F7C9C] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setView("map")}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${view === "map" ? "bg-[#2F7C9C] text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                <MapIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Map view */}
        {view === "map" && (
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            {placeId ? (
              <LiteAPIMapWidget
                placeId={placeId}
                height="600px"
                checkin={checkin}
                checkout={checkout}
                adults={adults}
                instanceId="results"
              />
            ) : (
              <div className="h-96 flex flex-col items-center justify-center bg-gray-50 text-gray-500 gap-2">
                <MapIcon className="h-10 w-10 text-gray-300" />
                <p className="text-sm font-medium">Map view isn't available for AI/vibe searches</p>
                <button onClick={() => setView("list")} className="text-xs text-[#2F7C9C] hover:underline">Back to list</button>
              </div>
            )}
          </div>
        )}

        {/* List view */}
        {view === "list" && (
          <>
            {loading && <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}</div>}

            {!loading && error && (
              <div className="flex flex-col items-center py-20 text-center gap-3">
                <p className="text-red-500 font-medium">{error}</p>
                <button onClick={() => window.location.reload()} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50">Try again</button>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && hotels.length > 0 && (
              <div className="flex flex-col items-center py-20 text-center gap-3">
                <div className="text-4xl">🔍</div>
                <p className="font-semibold text-gray-700">No hotels match your filters</p>
                <button onClick={() => setFilters(defaultFilters)} className="text-sm text-[#2F7C9C] hover:underline">Clear all filters</button>
              </div>
            )}

            {!loading && !error && hotels.length === 0 && (
              <div className="flex flex-col items-center py-20 text-center gap-3">
                <div className="text-4xl">😕</div>
                <p className="font-semibold text-gray-700">No hotels found</p>
                <p className="text-sm text-gray-500">Try different dates or destination.</p>
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-4">
                {filtered.map((hotel) => {
                  const price = getPrice(hotel);
                  const cur = getCurrency(hotel);
                  const refundable = isRefundable(hotel);
                  return (
                    <HotelCard
                      key={hotel.hotelId}
                      hotel={hotel}
                      checkin={checkin}
                      checkout={checkout}
                      adults={adults}
                      price={price}
                      totalPrice={price != null ? price * n : null}
                      currency={cur}
                      refundable={refundable}
                      nights={n}
                      isAI={isAI}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Hotel Card ────────────────────────────────────────────────────────────────
interface CardProps {
  hotel: HotelRateResult;
  checkin: string;
  checkout: string;
  adults: number;
  price: number | null;
  totalPrice: number | null;
  currency: string;
  refundable: boolean;
  nights: number;
  isAI: boolean;
}

function HotelCard({ hotel, checkin, checkout, adults, price, totalPrice, currency, refundable, nights, isAI }: CardProps) {
  const detailUrl = `/hotel/${hotel.hotelId}?checkin=${checkin}&checkout=${checkout}&adults=${adults}`;
  const rLabel = hotel.rating ? ratingLabel(hotel.rating) : null;

  return (
    <Link href={detailUrl} className="block group">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-56 shrink-0 aspect-[4/3] sm:aspect-auto sm:min-h-[200px] bg-gray-100">
          {hotel.main_photo ? (
            <Image
              src={hotel.main_photo}
              alt={hotel.name ?? "Hotel"}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, 224px"
            />
          ) : (
            <div className="h-full w-full min-h-[200px] flex items-center justify-center bg-gradient-to-br from-[#e8f4fa] to-[#6FAFD0]/30">
              <MapPin className="h-10 w-10 text-[#2F7C9C]/30" />
            </div>
          )}
          {isAI && hotel.tags && hotel.tags.length > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-purple-600 px-2 py-0.5">
              <Sparkles className="h-3 w-3 text-white" />
              <span className="text-[10px] font-bold text-white">AI Pick</span>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between gap-3 min-w-0">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-gray-900 text-base leading-tight group-hover:text-[#2F7C9C] transition-colors line-clamp-2">
                  {hotel.name ?? hotel.hotelId}
                </h2>
                {hotel.address && (
                  <p className="mt-0.5 text-xs text-gray-500 flex items-center gap-1 line-clamp-1">
                    <MapPin className="h-3 w-3 shrink-0" />{hotel.address}
                  </p>
                )}
              </div>
              {rLabel && hotel.rating && (
                <div className="shrink-0 flex flex-col items-end gap-0.5">
                  <div className={`${rLabel.color} text-white text-xs font-bold rounded-lg px-2 py-0.5 whitespace-nowrap`}>{rLabel.label}</div>
                  <span className="text-xs text-gray-500 font-semibold">{hotel.rating.toFixed(1)} / 10</span>
                </div>
              )}
            </div>

            {hotel.starRating != null && hotel.starRating > 0 && (
              <div className="mt-1.5 flex items-center gap-0.5">
                {Array.from({ length: Math.min(5, Math.round(hotel.starRating)) }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1 text-xs text-gray-400">{hotel.starRating}-star hotel</span>
              </div>
            )}

            {isAI && hotel.story && (
              <p className="mt-2 text-xs text-gray-600 line-clamp-2 italic">"{hotel.story}"</p>
            )}
            {isAI && hotel.tags && hotel.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {hotel.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="text-[11px] bg-purple-50 text-purple-700 border border-purple-100 rounded-full px-2 py-0.5 font-medium">{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-end justify-between gap-4 flex-wrap pt-1">
            <div>
              {refundable && (
                <p className="text-xs text-green-600 font-medium flex items-center gap-1 mb-1">
                  <ShieldCheck className="h-3.5 w-3.5" />Free cancellation
                </p>
              )}
              {price != null ? (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-900">{fmtPrice(price, currency)}</span>
                    <span className="text-sm text-gray-500">/night</span>
                  </div>
                  {nights > 1 && totalPrice != null && (
                    <p className="text-xs text-gray-400">{fmtPrice(totalPrice, currency)} total for {nights} nights</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400">Price unavailable</p>
              )}
            </div>
            <button
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-white bg-[#E76D38] hover:bg-[#c45a2a] transition-colors shrink-0 shadow-sm"
              onClick={(e) => { e.preventDefault(); window.location.href = detailUrl; }}
            >
              See Rooms
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
