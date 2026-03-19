"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Zap, ExternalLink, MapPin, Clock, Star } from "lucide-react";
import type { DbDeal, DbHotel, DbCity } from "@/types";
import { formatCurrency, timeUntil, cn } from "@/lib/utils";

interface FlashDealsCarouselProps {
  deals: (DbDeal & { hotel: DbHotel & { city: DbCity } })[];
  title?: string;
  subtitle?: string;
}

export function FlashDealsCarousel({ deals, title = "Flash Deals", subtitle = "Expiring soon — book before they're gone" }: FlashDealsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };
  if (!deals.length) return null;

  return (
    <section className="py-10">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: '#E76D38' }}>
            <Zap className="h-5 w-5 fill-white text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll("left")} className="rounded-full border border-gray-200 bg-white p-2.5 shadow-sm hover:bg-gray-50 transition-colors">
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button onClick={() => scroll("right")} className="rounded-full border border-gray-200 bg-white p-2.5 shadow-sm hover:bg-gray-50 transition-colors">
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory">
        {deals.map((deal) => {
          const bookingUrl = (() => {
            const params = new URLSearchParams({ adults: "2" });
            if (deal.check_in_date) params.set("checkin", deal.check_in_date);
            if (deal.check_out_date) params.set("checkout", deal.check_out_date);
            if (deal.hotel?.source_id) return `/hotel/${deal.hotel.source_id}?${params.toString()}`;
            params.set("aiSearch", deal.hotel?.name ?? "");
            return `/hotels?${params.toString()}`;
          })();
          return (
            <div key={deal.id} className="w-60 sm:w-72 shrink-0 snap-start overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="relative h-44 overflow-hidden bg-gray-100">
                {deal.hotel?.image_url ? (
                  <Image src={deal.hotel.image_url} alt={deal.hotel.name} fill className="object-cover" sizes="288px" />
                ) : (
                  <div className="flex h-full items-center justify-center" style={{ background: 'linear-gradient(135deg, #e8f4fa 0%, #6FAFD0 100%)' }}>
                    <Zap className="h-10 w-10 text-white/70" />
                  </div>
                )}
                <div className="absolute right-2 top-2 rounded-xl px-2.5 py-1 text-sm font-black text-white shadow" style={{ backgroundColor: '#E76D38' }}>
                  -{Math.round(deal.savings_percent)}%
                </div>
                {deal.expires_at && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-white" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <Clock className="h-3 w-3" />
                    {timeUntil(deal.expires_at)}
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <MapPin className="h-3 w-3" />{deal.hotel?.city?.name}
                </div>
                <p className="font-semibold text-gray-900 line-clamp-1 text-sm">{deal.hotel?.name}</p>
                {deal.hotel?.rating_score != null && (
                  <div className="mt-0.5 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold" style={{ color: '#2F7C9C' }}>{deal.hotel.rating_score.toFixed(1)}</span>
                  </div>
                )}
                <div className="mt-2.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-gray-900">{formatCurrency(deal.deal_price)}</span>
                      <span className="text-xs text-gray-400 line-through">{formatCurrency(deal.original_price)}</span>
                    </div>
                    <p className="text-xs text-gray-500">per night</p>
                  </div>
                  <Link href={bookingUrl}>
                    <button className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: '#E76D38' }}>
                      View Deal<ExternalLink className="h-3 w-3" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
