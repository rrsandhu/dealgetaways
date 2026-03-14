import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Star,
  ChevronLeft,
  ShieldCheck,
  ShieldOff,
  Wifi,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHotelDetails, searchRates, type HotelDetails, type RoomRate } from "@/lib/liteapi-server";
import { buildLiteAPIDeepLink } from "@/lib/liteapi";

interface PageProps {
  params: Promise<{ hotelId: string }>;
  searchParams: Promise<{
    checkin?: string;
    checkout?: string;
    adults?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hotelId } = await params;
  const res = await getHotelDetails(hotelId).catch(() => null);
  if (!res?.data) return { title: "Hotel Details" };
  return {
    title: `${res.data.name} — Book Now`,
    description: res.data.hotelDescription?.replace(/<[^>]+>/g, "").slice(0, 160),
  };
}

export default async function HotelDetailPage({ params, searchParams: searchParamsProp }: PageProps) {
  const { hotelId } = await params;
  const sp = await searchParamsProp;
  const checkin = sp.checkin ?? "";
  const checkout = sp.checkout ?? "";
  const adults = Number(sp.adults ?? 2);

  const hotelRes = await getHotelDetails(hotelId).catch(() => null);
  if (!hotelRes?.data) notFound();

  const hotel = hotelRes.data;
  const mainPhoto =
    hotel.main_photo ??
    hotel.hotelImages?.find((i) => i.defaultImage)?.url ??
    hotel.hotelImages?.[0]?.url;

  const nights = checkin && checkout
    ? Math.max(1, (new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000)
    : 0;

  function fmt(d: string) {
    return new Date(d + "T12:00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="border-b bg-white px-4 py-3">
        <div className="mx-auto max-w-5xl flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-[#2F7C9C]">Home</Link>
          <span>/</span>
          <Link
            href={`/hotels?${new URLSearchParams({ ...(checkin && { checkin }), ...(checkout && { checkout }), adults: String(adults) })}`}
            className="hover:text-[#2F7C9C]"
          >
            Hotels
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium line-clamp-1">{hotel.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* ── Left: hotel info ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Hero image */}
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-200">
              {mainPhoto ? (
                <Image src={mainPhoto} alt={hotel.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" priority />
              ) : (
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-[#2F7C9C]/20 to-[#1f5a73]/20">
                  <MapPin className="h-16 w-16 text-[#2F7C9C]/30" />
                </div>
              )}
            </div>

            {/* Image grid (additional photos) */}
            {(hotel.hotelImages?.length ?? 0) > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {hotel.hotelImages!.slice(1, 4).map((img, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                    <Image src={img.url} alt="" fill className="object-cover" sizes="33vw" />
                  </div>
                ))}
              </div>
            )}

            {/* Hotel overview */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900">{hotel.name}</h1>
                  <div className="mt-1 flex items-center gap-1 text-gray-500 text-sm">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>
                      {hotel.address ? `${hotel.address}` : ""}
                      {hotel.city ? (hotel.address ? `, ${hotel.city}` : hotel.city) : ""}
                      {hotel.country ? `, ${hotel.country}` : ""}
                    </span>
                  </div>
                  {hotel.starRating && (
                    <div className="mt-2 flex items-center gap-1">
                      {Array.from({ length: Math.min(5, hotel.starRating) }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="ml-1 text-sm text-gray-500">{hotel.starRating}-star</span>
                    </div>
                  )}
                </div>
                {hotel.rating && (
                  <div className="flex flex-col items-center bg-[#2F7C9C] text-white rounded-xl px-3 py-2 shrink-0">
                    <span className="text-xl font-black">{hotel.rating.toFixed(1)}</span>
                    <span className="text-xs opacity-80">/ 10</span>
                  </div>
                )}
              </div>

              {hotel.hotelDescription && (
                <div
                  className="mt-4 text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: hotel.hotelDescription }}
                />
              )}
            </div>

            {/* Facilities */}
            {(hotel.hotelFacilities?.length ?? 0) > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Facilities</h2>
                <div className="flex flex-wrap gap-2">
                  {hotel.hotelFacilities!.slice(0, 16).map((f) => (
                    <span key={f} className="flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 text-gray-700 rounded-full px-3 py-1.5">
                      <Wifi className="h-3 w-3 text-[#2F7C9C] shrink-0" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Policies */}
            {(hotel.policies?.length ?? 0) > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Policies</h2>
                <div className="space-y-2">
                  {hotel.policies!.slice(0, 4).map((p) => (
                    <div key={p.name}>
                      <span className="text-sm font-medium text-gray-800">{p.name}:</span>
                      <span className="text-sm text-gray-600 ml-1">{p.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Room rates */}
            <div id="rooms">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Available Rooms</h2>
              {checkin && checkout ? (
                <Suspense fallback={
                  <div className="flex items-center gap-3 py-12 justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#2F7C9C]" />
                    <span className="text-gray-500">Loading live rates…</span>
                  </div>
                }>
                  <RoomRatesSection
                    hotelId={hotelId}
                    hotel={hotel}
                    checkin={checkin}
                    checkout={checkout}
                    adults={adults}
                    nights={nights}
                  />
                </Suspense>
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                  <p className="font-medium">Select your dates to see available rooms and rates.</p>
                  <Link href={`/hotels`} className="mt-3 inline-block">
                    <Button variant="outline" size="sm">
                      <ChevronLeft className="h-4 w-4" />
                      Back to search
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Sticky sidebar ── */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Date summary */}
              {checkin && checkout ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3">Your stay</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Check-in</span>
                      <span className="font-medium">{fmt(checkin)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Check-out</span>
                      <span className="font-medium">{fmt(checkout)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-medium">{nights} {nights === 1 ? "night" : "nights"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Guests</span>
                      <span className="font-medium">{adults} {adults === 1 ? "adult" : "adults"}</span>
                    </div>
                  </div>
                  <a
                    href="#rooms"
                    className="mt-4 block"
                  >
                    <Button className="w-full bg-[#E76D38] hover:bg-[#c45a2a] text-white">
                      See available rooms
                    </Button>
                  </a>
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <p className="text-sm text-gray-500 text-center">Add dates to see prices</p>
                </div>
              )}

              {/* Location */}
              {hotel.location && (
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                  <p className="text-sm text-gray-600">
                    {hotel.address ?? ""}
                    {hotel.city ? (hotel.address ? `, ${hotel.city}` : hotel.city) : ""}
                  </p>
                  <a
                    href={`https://maps.google.com/?q=${hotel.location.latitude},${hotel.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-[#2F7C9C] hover:underline"
                  >
                    View on Google Maps <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Room rates section (async server component, streamed) ─────────────────────

interface RoomRatesSectionProps {
  hotelId: string;
  hotel: HotelDetails;
  checkin: string;
  checkout: string;
  adults: number;
  nights: number;
}

async function RoomRatesSection({
  hotelId,
  hotel,
  checkin,
  checkout,
  adults,
  nights,
}: RoomRatesSectionProps) {
  const ratesRes = await searchRates({
    hotelIds: [hotelId],
    checkin,
    checkout,
    adults,
  }).catch(() => null);

  if (!ratesRes || !ratesRes.results?.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        <p>No available rooms for these dates. Please try different dates.</p>
      </div>
    );
  }

  const hotelRates = ratesRes.results[0];

  // Flatten all offer+rate pairs
  type OfferRate = RoomRate & { offerId: string };
  const allRates: OfferRate[] = hotelRates.roomTypes.flatMap((rt) =>
    (rt.rates ?? []).map((r) => ({ ...r, offerId: rt.offerId }))
  );

  // Group by mappedRoomId (fall back to offerId if missing)
  const groups = new Map<string | number, OfferRate[]>();
  for (const rate of allRates) {
    const key = rate.mappedRoomId ?? rate.offerId;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(rate);
  }

  // Build room info lookup from hotel.rooms
  const roomInfoMap = new Map<number, { roomName: string; photoUrl?: string }>();
  for (const room of hotel.rooms ?? []) {
    roomInfoMap.set(room.id, {
      roomName: room.roomName,
      photoUrl: room.photos?.[0]?.url,
    });
  }

  return (
    <div className="space-y-5">
      {Array.from(groups.entries()).map(([roomKey, rates]) => {
        const roomInfo = typeof roomKey === "number" ? roomInfoMap.get(roomKey) : undefined;
        const displayName = roomInfo?.roomName ?? rates[0]?.name ?? "Room";
        const photoUrl = roomInfo?.photoUrl;

        return (
          <div key={String(roomKey)} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            {/* Room header */}
            <div className="flex items-center gap-4 p-4 border-b border-gray-100">
              {photoUrl ? (
                <div className="relative h-16 w-24 rounded-xl overflow-hidden shrink-0">
                  <Image src={photoUrl} alt={displayName} fill className="object-cover" sizes="96px" />
                </div>
              ) : (
                <div className="h-16 w-24 rounded-xl bg-[#e8f4fa] flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-[#2F7C9C]/40" />
                </div>
              )}
              <h3 className="font-semibold text-gray-900">{displayName}</h3>
            </div>

            {/* Rate options */}
            <div className="divide-y divide-gray-100">
              {rates.map((rate, idx) => {
                const price = rate.retailRate?.total?.[0]?.amount;
                const currency = rate.retailRate?.total?.[0]?.currency ?? "CAD";
                const totalPrice = price != null ? price * nights : null;
                const taxIncluded = rate.retailRate?.taxesAndFees?.[0]?.included ?? true;
                const isRefundable = rate.cancellationPolicies?.refundableTag === "RFN";
                const cancelTime = rate.cancellationPolicies?.cancelPolicyInfos?.[0]?.cancelTime;

                const deepLink = buildLiteAPIDeepLink({
                  hotelId,
                  checkin,
                  checkout,
                  adults,
                  currency,
                });

                return (
                  <div
                    key={`${rate.offerId}-${idx}`}
                    className="flex items-center justify-between gap-4 px-4 py-4 flex-wrap"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium text-gray-800">{rate.boardName ?? "Room only"}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {isRefundable ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Free cancellation
                            {cancelTime && ` before ${new Date(cancelTime).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}`}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <ShieldOff className="h-3.5 w-3.5" />
                            Non-refundable
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {taxIncluded ? "Taxes included" : "Taxes extra"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        {price != null ? (
                          <>
                            <p className="text-xl font-black text-gray-900">
                              {currency} {price.toFixed(0)}
                            </p>
                            <p className="text-xs text-gray-500">/night</p>
                            {nights > 1 && totalPrice != null && (
                              <p className="text-xs text-gray-400">
                                {currency} {totalPrice.toFixed(0)} total
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-gray-400">Price unavailable</p>
                        )}
                      </div>
                      <a
                        href={deepLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="bg-[#E76D38] hover:bg-[#c45a2a] text-white shrink-0">
                          View Deal
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
