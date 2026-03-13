"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, ExternalLink, Star, ShieldCheck } from "lucide-react";
import type { DbDeal, DbHotel, DbCity } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { buildBookingUrl } from "@/lib/utm";

interface DestinationCarouselProps {
  title: string;
  subtitle?: string;
  deals: (DbDeal & { hotel: DbHotel & { city?: DbCity } })[];
  citySlug?: string;
}

export function DestinationCarousel({ title, subtitle, deals, citySlug }: DestinationCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };
  if (!deals.length) return null;

  return (
    <section className="py-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {citySlug && (
            <Link
              href={`/deals/${citySlug}`}
              className="hidden sm:block text-sm font-semibold hover:underline mr-1"
              style={{ color: '#2F7C9C' }}
            >
              See all →
            </Link>
          )}
          <button onClick={() => scroll("left")} className="rounded-full border border-gray-200 bg-white p-2 shadow-sm hover:bg-gray-50 transition-colors">
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button onClick={() => scroll("right")} className="rounded-full border border-gray-200 bg-white p-2 shadow-sm hover:bg-gray-50 transition-colors">
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
        {deals.map((deal) => {
          const bookingUrl = buildBookingUrl(deal.booking_url ?? "#");
          const savingsPct = Math.round(deal.savings_percent);
          return (
            <div key={deal.id} className="w-64 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className="relative h-40 overflow-hidden bg-gray-100">
                {deal.hotel?.image_url ? (
                  <Image src={deal.hotel.image_url} alt={deal.hotel.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="256px" />
                ) : (
                  <div className="flex h-full items-center justify-center" style={{ background: 'linear-gradient(135deg, #e8f4fa 0%, #6FAFD0 100%)' }}>
                    <MapPin className="h-8 w-8 text-white/70" />
                  </div>
                )}
                <div className="absolute right-2 top-2 rounded-lg px-2 py-0.5 text-xs font-black text-white" style={{ backgroundColor: '#E76D38' }}>
                  -{savingsPct}%
                </div>
              </div>
              <div className="p-3.5">
                <Link href={`/hotels/${deal.hotel?.id}`}>
                  <p className="font-semibold text-gray-900 hover:text-[#2F7C9C] transition-colors line-clamp-1 text-sm">{deal.hotel?.name}</p>
                </Link>
                <div className="mt-1 flex items-center gap-1.5">
                  {deal.hotel?.star_rating > 0 && (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: Math.min(deal.hotel.star_rating, 5) }).map((_, i) => (
                        <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  )}
                  {deal.hotel?.rating_score != null && (
                    <span className="text-xs font-semibold" style={{ color: '#2F7C9C' }}>{deal.hotel.rating_score.toFixed(1)}</span>
                  )}
                  {deal.is_refundable && <ShieldCheck className="h-3 w-3 text-green-500 ml-auto" />}
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-black text-gray-900">{formatCurrency(deal.deal_price)}</span>
                      <span className="text-xs text-gray-400 line-through">{formatCurrency(deal.original_price)}</span>
                    </div>
                    <p className="text-xs text-gray-500">/ night</p>
                  </div>
                  <a href={bookingUrl} target="_blank" rel="noopener noreferrer sponsored">
                    <button className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: '#E76D38' }}>
                      View<ExternalLink className="h-2.5 w-2.5" />
                    </button>
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
