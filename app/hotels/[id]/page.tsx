import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Star,
  MapPin,
  ExternalLink,
  Clock,
  ChevronLeft,
  TrendingDown,
} from "lucide-react";
import { DealUrgencyBanner } from "@/components/deals/deal-urgency-banner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getHotelById,
  getDealsByHotel,
  getPriceHistory,
} from "@/lib/supabase/queries";
import { formatCurrency, formatDate, isExpiringSoon, cn } from "@/lib/utils";
import { buildBookingUrl } from "@/lib/utm";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const hotel = await getHotelById(params.id).catch(() => null);
  if (!hotel) return { title: "Hotel Not Found" };

  return {
    title: `${hotel.name} — Hotel Deals`,
    description:
      hotel.description?.slice(0, 160) ??
      `Find the best deals for ${hotel.name} in ${hotel.city?.name ?? "Canada"}.`,
  };
}

export default async function HotelDetailPage({ params }: PageProps) {
  const [hotel, deals, priceHistory] = await Promise.all([
    getHotelById(params.id).catch(() => null),
    getDealsByHotel(params.id).catch(() => []),
    getPriceHistory(params.id).catch(() => []),
  ]);

  if (!hotel) notFound();

  const bestDeal = deals[0];
  const expiringSoon = bestDeal ? isExpiringSoon(bestDeal.expires_at) : false;
  const bookingUrl = buildBookingUrl(bestDeal?.booking_url ?? "#");

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    address: {
      "@type": "PostalAddress",
      addressLocality: hotel.city?.name ?? "",
      addressCountry: "CA",
    },
    starRating: { "@type": "Rating", ratingValue: hotel.star_rating },
    description: hotel.description ?? "",
    ...(hotel.image_url ? { image: hotel.image_url } : {}),
    ...(bestDeal
      ? {
          offers: {
            "@type": "Offer",
            price: bestDeal.deal_price,
            priceCurrency: "CAD",
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <div className="border-b border-gray-200 bg-white px-4 py-3">
          <div className="mx-auto flex max-w-5xl items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <span>/</span>
            {hotel.city && (
              <>
                <Link
                  href={`/deals/${hotel.city.slug}`}
                  className="hover:text-blue-600"
                >
                  {hotel.city.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-900 font-medium line-clamp-1">
              {hotel.name}
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image gallery */}
              <div className="relative overflow-hidden rounded-2xl bg-gray-200 aspect-[16/9]">
                {hotel.image_url ? (
                  <Image
                    src={hotel.image_url}
                    alt={hotel.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                    <MapPin className="h-16 w-16 text-blue-400" />
                  </div>
                )}
                {bestDeal && (
                  <div className="absolute right-4 top-4 rounded-xl bg-red-500 px-3 py-1.5 text-lg font-black text-white shadow">
                    -{Math.round(bestDeal.savings_percent)}% OFF
                  </div>
                )}
              </div>

              {/* Hotel overview */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {hotel.name}
                    </h1>
                    {hotel.city && (
                      <div className="mt-1 flex items-center gap-1 text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span>{hotel.city.name}, Canada</span>
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < hotel.star_rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-gray-200 text-gray-200"
                          )}
                        />
                      ))}
                      <span className="ml-1 text-sm text-gray-500">
                        {hotel.star_rating}-star hotel
                      </span>
                    </div>
                  </div>
                </div>

                {hotel.description && (
                  <p className="mt-4 text-gray-600 leading-relaxed">
                    {hotel.description}
                  </p>
                )}
              </div>

              {/* Urgency banner */}
              {bestDeal?.expires_at && expiringSoon && (
                <DealUrgencyBanner
                  expiresAt={bestDeal.expires_at}
                  savingsPercent={bestDeal.savings_percent}
                />
              )}

              {/* All deals for this hotel */}
              {deals.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Available Deals
                  </h2>
                  <div className="space-y-3">
                    {deals.map((deal) => (
                      <div
                        key={deal.id}
                        className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                              {deal.source ?? "Direct booking"}
                            </span>
                            {deal.expires_at && isExpiringSoon(deal.expires_at) && (
                              <Badge variant="flash" className="text-xs">
                                <Clock className="mr-1 h-3 w-3" />
                                Ends soon
                              </Badge>
                            )}
                          </div>
                          {deal.check_in_date && deal.check_out_date && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatDate(deal.check_in_date)} →{" "}
                              {formatDate(deal.check_out_date)}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-black text-gray-900">
                              {formatCurrency(deal.deal_price)}
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              {formatCurrency(deal.original_price)}
                            </span>
                          </div>
                          <div className="text-xs text-green-600 font-medium">
                            Save {Math.round(deal.savings_percent)}%
                          </div>
                        </div>
                        <a
                          href={buildBookingUrl(deal.booking_url ?? "#")}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                        >
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shrink-0">
                            Book
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price history */}
              {priceHistory.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Price History
                    </h2>
                  </div>
                  <div className="flex items-end gap-1 h-24">
                    {priceHistory.slice(-20).map((ph, i) => {
                      const maxPrice = Math.max(...priceHistory.map((p) => p.price));
                      const height = Math.max(10, (ph.price / maxPrice) * 100);
                      return (
                        <div
                          key={ph.id}
                          className="relative flex-1 group"
                          style={{ height: `${height}%` }}
                          title={`${formatCurrency(ph.price)} on ${formatDate(ph.recorded_at)}`}
                        >
                          <div className="absolute inset-0 rounded-sm bg-blue-200 group-hover:bg-blue-400 transition-colors" />
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-400">
                    <span>{formatDate(priceHistory[0]?.recorded_at)}</span>
                    <span>{formatDate(priceHistory[priceHistory.length - 1]?.recorded_at)}</span>
                  </div>
                </div>
              )}

              {/* Map placeholder */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">
                  Location
                </h2>
                <div className="flex h-48 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                  <div className="text-center">
                    <MapPin className="mx-auto h-8 w-8 mb-2" />
                    <p className="text-sm">
                      {hotel.city?.name}, Canada
                    </p>
                    <p className="text-xs mt-1">Map integration available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {bestDeal ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="font-semibold text-gray-900">
                        Best Deal Available
                      </h2>
                      <Badge variant="deal">
                        -{Math.round(bestDeal.savings_percent)}%
                      </Badge>
                    </div>

                    <div className="mb-1">
                      <span className="text-3xl font-black text-gray-900">
                        {formatCurrency(bestDeal.deal_price)}
                      </span>
                      <span className="ml-2 text-sm text-gray-400 line-through">
                        {formatCurrency(bestDeal.original_price)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">per night</p>

                    {bestDeal.check_in_date && bestDeal.check_out_date && (
                      <p className="mt-2 text-xs text-gray-500">
                        {formatDate(bestDeal.check_in_date)} →{" "}
                        {formatDate(bestDeal.check_out_date)}
                      </p>
                    )}

                    {bestDeal.source && (
                      <p className="mt-1 text-xs text-gray-400">
                        via {bestDeal.source}
                      </p>
                    )}

                    {bestDeal.expires_at && expiringSoon && (
                      <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-orange-600">
                        <Clock className="h-4 w-4" />
                        <span>{isExpiringSoon(bestDeal.expires_at) ? "Expires soon" : ""}</span>
                      </div>
                    )}

                    <a
                      href={bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="mt-5 block"
                    >
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="lg"
                      >
                        View Deal
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>

                    <p className="mt-2 text-center text-xs text-gray-400">
                      Opens on {bestDeal.source ?? "booking site"}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
                    <p className="text-gray-500">
                      No active deals right now. Check back soon.
                    </p>
                  </div>
                )}

                {hotel.city && (
                  <Link href={`/deals/${hotel.city.slug}`}>
                    <Button variant="outline" className="w-full">
                      <ChevronLeft className="h-4 w-4" />
                      More {hotel.city.name} deals
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
