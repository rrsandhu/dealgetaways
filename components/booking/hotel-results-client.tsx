"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HotelRateResult } from "@/lib/liteapi-server";

interface Props {
  placeId?: string;
  destination?: string;
  aiSearch?: string;
  checkin: string;
  checkout: string;
  adults: number;
}

function nights(checkin: string, checkout: string) {
  if (!checkin || !checkout) return 1;
  return Math.max(
    1,
    (new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000
  );
}

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d + "T12:00:00").toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
}

export function HotelResultsClient({ placeId, destination, aiSearch, checkin, checkout, adults }: Props) {
  const [hotels, setHotels] = useState<HotelRateResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAI = !!aiSearch;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
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
        setHotels(data.results ?? []);
      } catch (e) {
        setError("Could not load hotels. Please try again.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId, aiSearch, checkin, checkout, adults]);

  const n = nights(checkin, checkout);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#2F7C9C]" />
        <p className="text-gray-600 font-medium">
          {isAI ? "Finding the perfect hotels for your vibe…" : "Fetching live rates…"}
        </p>
        <p className="text-sm text-gray-400">This may take a few seconds</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-20 text-center gap-3">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center gap-3">
        <div className="text-4xl">😕</div>
        <p className="font-semibold text-gray-700">No hotels found</p>
        <p className="text-sm text-gray-500">Try different dates, destination, or fewer guests.</p>
      </div>
    );
  }

  const searchLabel = aiSearch
    ? `Results for "${aiSearch}"`
    : destination
    ? `Hotels in ${destination}`
    : "Hotel Results";

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {isAI && <Sparkles className="h-5 w-5 text-purple-500" />}
            {searchLabel}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {hotels.length} hotels · {formatDate(checkin)} → {formatDate(checkout)} · {n}{" "}
            {n === 1 ? "night" : "nights"} · {adults}{" "}
            {adults === 1 ? "adult" : "adults"}
          </p>
        </div>
      </div>

      {/* Hotel cards */}
      <div className="space-y-4">
        {hotels.map((hotel) => {
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
    </div>
  );
}

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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row">
      {/* Image */}
      <div className="relative w-full sm:w-52 md:w-64 shrink-0 aspect-[4/3] sm:aspect-auto sm:h-auto bg-gray-100">
        {hotel.main_photo ? (
          <Image
            src={hotel.main_photo}
            alt={hotel.name ?? "Hotel"}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 256px"
          />
        ) : (
          <div className="h-full w-full min-h-[160px] flex items-center justify-center bg-gradient-to-br from-[#2F7C9C]/20 to-[#1f5a73]/20">
            <MapPin className="h-10 w-10 text-[#2F7C9C]/40" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-900 text-base leading-tight line-clamp-1">
                {hotel.name ?? hotel.hotelId}
              </h2>
              {hotel.address && (
                <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-1">{hotel.address}</span>
                </p>
              )}
            </div>
            {/* Star rating */}
            {hotel.starRating && (
              <div className="flex items-center gap-1 shrink-0">
                {Array.from({ length: Math.min(5, hotel.starRating) }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            )}
          </div>

          {/* AI tags/story */}
          {isAI && hotel.story && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{hotel.story}</p>
          )}
          {isAI && hotel.tags && hotel.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {hotel.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2.5 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Guest rating */}
          {hotel.rating && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 rounded-lg px-2.5 py-1">
              <span className="text-sm font-bold text-blue-700">{hotel.rating.toFixed(1)}</span>
              <span className="text-xs text-blue-500">/10</span>
            </div>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            {price != null ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-gray-900">
                    {currency} {price.toFixed(0)}
                  </span>
                  <span className="text-sm text-gray-500">/night</span>
                </div>
                {nights > 1 && totalPrice != null && (
                  <p className="text-xs text-gray-500">
                    {currency} {totalPrice.toFixed(0)} total · {nights} nights
                  </p>
                )}
                {isRefundable && (
                  <p className="text-xs text-green-600 font-medium mt-0.5">✓ Free cancellation</p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">Price unavailable</p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap shrink-0">
            <Link href={detailUrl}>
              <Button variant="outline" size="sm">
                See rooms
              </Button>
            </Link>
            <Link href={detailUrl}>
              <Button
                size="sm"
                className="bg-[#E76D38] hover:bg-[#c45a2a] text-white"
              >
                View Deal
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
