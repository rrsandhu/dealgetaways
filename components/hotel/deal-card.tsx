import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Clock, Zap, ExternalLink, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DbDeal, DbHotel, DbCity } from "@/types";
import { formatCurrency, timeUntil, isExpiringSoon, cn } from "@/lib/utils";
import { buildBookingUrl } from "@/lib/utm";

interface DealCardProps {
  deal: DbDeal;
  hotel: DbHotel & { city?: DbCity };
  isBlurred?: boolean;
  variant?: "grid" | "list";
}

export function DealCard({
  deal,
  hotel,
  isBlurred = false,
  variant = "grid",
}: DealCardProps) {
  const expiringSoon = isExpiringSoon(deal.expires_at);
  const bookingUrl = buildBookingUrl(deal.booking_url ?? "#");

  if (variant === "list") {
    return (
      <div className="group relative flex overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
        {/* Image */}
        <div className="relative h-auto w-40 shrink-0 overflow-hidden bg-gray-100 sm:w-52">
          {hotel.image_url ? (
            <Image
              src={hotel.image_url}
              alt={hotel.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="208px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
              <MapPin className="h-8 w-8 text-blue-400" />
            </div>
          )}
          {expiringSoon && (
            <div className="absolute left-2 top-2">
              <Badge variant="flash" className="text-xs">
                <Zap className="mr-1 h-3 w-3" />
                Ends soon
              </Badge>
            </div>
          )}
          <div className="absolute right-2 top-2 rounded-lg bg-red-500 px-2 py-1 text-xs font-bold text-white">
            -{Math.round(deal.savings_percent)}%
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-0.5">
                  <MapPin className="h-3 w-3" />
                  {hotel.city?.name ?? "Canada"}
                </div>
                <Link href={`/hotels/${hotel.id}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-blue-700 transition-colors leading-snug">
                    {hotel.name}
                  </h3>
                </Link>
              </div>
              {hotel.star_rating > 0 && (
                <div className="flex shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-2 py-1">
                  <Star className="h-3 w-3 fill-white text-white" />
                  <span className="text-xs font-bold text-white">
                    {hotel.star_rating}★
                  </span>
                </div>
              )}
            </div>

            {hotel.rating_score != null && (
              <div className="mt-1 flex items-center gap-1">
                <span className="text-xs font-semibold text-blue-700">
                  {hotel.rating_score.toFixed(1)}
                </span>
                {hotel.review_count != null && (
                  <span className="text-xs text-gray-400">
                    ({hotel.review_count.toLocaleString()} reviews)
                  </span>
                )}
              </div>
            )}

            {deal.is_refundable && (
              <div className="mt-1 flex items-center gap-1 text-xs font-medium text-green-600">
                <ShieldCheck className="h-3 w-3" />
                Free cancellation
              </div>
            )}

            {deal.source && (
              <p className="mt-1 text-xs text-gray-400">via {deal.source}</p>
            )}

            {expiringSoon && deal.expires_at && (
              <div className="mt-2 flex items-center gap-1 text-xs font-medium text-orange-600">
                <Clock className="h-3.5 w-3.5" />
                {timeUntil(deal.expires_at)}
              </div>
            )}
          </div>

          <div
            className={cn(
              "flex items-end justify-between pt-3",
              isBlurred && "select-none"
            )}
          >
            <div className={cn(isBlurred && "blur-sm")}>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900">
                  {formatCurrency(deal.deal_price)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {formatCurrency(deal.original_price)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                per night{deal.nights != null ? ` · ${deal.nights} nights` : ""}
              </p>
              {deal.check_in_date && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(deal.check_in_date).toLocaleDateString("en-CA", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>

            {isBlurred ? (
              <Link href="/premium">
                <Button size="sm" variant="premium">
                  Unlock Deal
                </Button>
              </Link>
            ) : (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
              >
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  View Deal
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            )}
          </div>
        </div>

        {isBlurred && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-[2px]">
            <Link href="/premium">
              <Button variant="premium" className="shadow-xl">
                🔓 Unlock with Premium
              </Button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Grid variant
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {hotel.image_url ? (
          <Image
            src={hotel.image_url}
            alt={hotel.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
            <MapPin className="h-10 w-10 text-blue-400" />
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {expiringSoon && (
            <Badge variant="flash" className="text-xs">
              <Zap className="mr-1 h-3 w-3" />
              Ends soon
            </Badge>
          )}
        </div>
        <div className="absolute right-2 top-2 rounded-xl bg-red-500 px-2.5 py-1 text-sm font-black text-white shadow">
          -{Math.round(deal.savings_percent)}%
        </div>
      </div>

      {/* Content */}
      <div className={cn("p-4", isBlurred && "select-none")}>
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
          <MapPin className="h-3 w-3" />
          {hotel.city?.name ?? "Canada"}
        </div>
        <Link href={`/hotels/${hotel.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-blue-700 transition-colors leading-snug line-clamp-1">
            {hotel.name}
          </h3>
        </Link>

        <div className="mt-1 flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 w-3",
                  i < hotel.star_rating
                    ? "fill-amber-400 text-amber-400"
                    : "fill-gray-200 text-gray-200"
                )}
              />
            ))}
          </div>
          {hotel.rating_score != null && (
            <span className="text-xs font-semibold text-blue-700">
              {hotel.rating_score.toFixed(1)}
              {hotel.review_count != null && (
                <span className="font-normal text-gray-400 ml-0.5">
                  ({hotel.review_count.toLocaleString()})
                </span>
              )}
            </span>
          )}
        </div>

        {deal.is_refundable && (
          <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-green-600">
            <ShieldCheck className="h-3 w-3" />
            Free cancellation
          </div>
        )}

        {expiringSoon && deal.expires_at && (
          <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-orange-600">
            <Clock className="h-3 w-3" />
            {timeUntil(deal.expires_at)}
          </div>
        )}

        <div
          className={cn(
            "mt-3 flex items-end justify-between",
            isBlurred && "blur-sm"
          )}
        >
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-gray-900">
                {formatCurrency(deal.deal_price)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(deal.original_price)}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              per night{deal.nights != null ? ` · ${deal.nights} nights` : ""}
            </p>
          </div>
        </div>

        <div className="mt-3">
          {isBlurred ? (
            <Link href="/premium" className="block">
              <Button variant="premium" className="w-full" size="sm">
                Unlock Deal
              </Button>
            </Link>
          ) : (
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="block"
            >
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                View Deal
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Blur overlay */}
      {isBlurred && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/50 backdrop-blur-[3px]">
          <Link href="/premium">
            <Button variant="premium" className="shadow-xl">
              🔓 Premium Only
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
