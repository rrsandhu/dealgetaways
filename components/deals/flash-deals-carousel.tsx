"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Zap, ExternalLink, MapPin, Clock } from "lucide-react";
import type { DbDeal, DbHotel, DbCity } from "@/types";
import { formatCurrency, timeUntil, cn } from "@/lib/utils";
import { buildBookingUrl } from "@/lib/utm";
import { Badge } from "@/components/ui/badge";

interface FlashDealsCarouselProps {
  deals: (DbDeal & { hotel: DbHotel & { city: DbCity } })[];
}

export function FlashDealsCarousel({ deals }: FlashDealsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  if (!deals.length) return null;

  return (
    <section className="py-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100">
            <Zap className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Flash Deals</h2>
            <p className="text-sm text-gray-500">
              Expiring deals — book before they&apos;re gone
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="rounded-full border border-gray-200 bg-white p-2 shadow-sm hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="rounded-full border border-gray-200 bg-white p-2 shadow-sm hover:bg-gray-50"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {deals.map((deal) => {
          const bookingUrl = buildBookingUrl(deal.booking_url ?? "#");
          return (
            <div
              key={deal.id}
              className="w-72 shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden bg-gray-100">
                {deal.hotel?.image_url ? (
                  <Image
                    src={deal.hotel.image_url}
                    alt={deal.hotel.name}
                    fill
                    className="object-cover"
                    sizes="288px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                    <Zap className="h-10 w-10 text-orange-400" />
                  </div>
                )}
                <div className="absolute right-2 top-2 rounded-xl bg-red-500 px-2.5 py-1 text-sm font-black text-white">
                  -{Math.round(deal.savings_percent)}%
                </div>
                {deal.expires_at && (
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="flash" className="text-xs">
                      <Clock className="mr-1 h-3 w-3" />
                      {timeUntil(deal.expires_at)}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <MapPin className="h-3 w-3" />
                  {deal.hotel?.city?.name}
                </div>
                <p className="font-semibold text-gray-900 line-clamp-1 text-sm">
                  {deal.hotel?.name}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-black text-gray-900">
                      {formatCurrency(deal.deal_price)}
                    </span>
                    <span className="ml-1.5 text-xs text-gray-400 line-through">
                      {formatCurrency(deal.original_price)}
                    </span>
                    <p className="text-xs text-gray-500">per night</p>
                  </div>
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Book
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
