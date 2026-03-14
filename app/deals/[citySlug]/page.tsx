import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { MapPin, Crown } from "lucide-react";
import { DealCard } from "@/components/hotel/deal-card";
import { SearchBar } from "@/components/search/search-bar";
import { CitySubscriptionGate } from "@/components/premium/city-subscription-gate";
import { LiteAPIMapWidget } from "@/components/liteapi/map-widget";
import { LiteAPIHotelsListWidget } from "@/components/liteapi/hotels-list-widget";
import { CITY_PLACE_IDS } from "@/lib/liteapi";
import { Button } from "@/components/ui/button";
import {
  getAllCities,
  getCityBySlug,
  getDealsByCity,
  getSubscribedCityIds,
  getUserByClerkId,
} from "@/lib/supabase/queries";
import Link from "next/link";

const FREE_DEAL_LIMIT = 3;

interface PageProps {
  params: Promise<{ citySlug: string }>;
}

// ─── Static generation ────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const cities = await getAllCities();
    return cities.map((city) => ({ citySlug: city.slug }));
  } catch {
    return [];
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { citySlug } = await params;
  const city = await getCityBySlug(citySlug).catch(() => null);
  if (!city) return { title: "City Not Found" };

  const title = `${city.name} Hotel Deals — Best Prices Today`;
  const description = `Find the best hotel deals in ${city.name}, Canada. Real-time prices updated daily. Save up to 50% on top hotels in ${city.name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_CA",
    },
    alternates: {
      canonical: `/deals/${city.slug}`,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CityDealsPage({ params }: PageProps) {
  const userId: string | null = null; // Auth disabled — re-enable with Clerk
  const { citySlug } = await params;
  const city = await getCityBySlug(citySlug).catch(() => null);
  if (!city) notFound();

  const allDeals = await getDealsByCity(city.id, 60).catch(() => []);

  // Determine if user has premium access for this city
  let hasAccess = false;
  if (userId) {
    const dbUser = await getUserByClerkId(userId).catch(() => null);
    if (dbUser) {
      const subscribedCities = await getSubscribedCityIds(dbUser.id).catch(
        () => [] as string[]
      );
      hasAccess = subscribedCities.includes(city.id);
    }
  }

  const visibleDeals = hasAccess ? allDeals : allDeals.slice(0, FREE_DEAL_LIMIT);
  const hiddenCount = allDeals.length - visibleDeals.length;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Hotel Deals in ${city.name}`,
    description: `Best hotel deals in ${city.name}, Canada`,
    numberOfItems: allDeals.length,
    itemListElement: visibleDeals.slice(0, 10).map((deal, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Hotel",
        name: deal.hotel?.name ?? "",
        offers: {
          "@type": "Offer",
          price: deal.deal_price,
          priceCurrency: "CAD",
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-gray-50 min-h-screen">
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-800 to-blue-900 py-10 px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-2 flex items-center gap-1.5 text-blue-200 text-sm">
              <Link href="/" className="hover:text-white">Home</Link>
              <span>/</span>
              <Link href="/cities" className="hover:text-white">Cities</Link>
              <span>/</span>
              <span className="text-white">{city.name}</span>
            </div>
            <h1 className="text-3xl font-black text-white sm:text-4xl">
              Hotel Deals in {city.name}
            </h1>
            <p className="mt-2 text-blue-200">
              {allDeals.length} active deals — updated daily
            </p>
            <div className="mt-5">
              <SearchBar
                variant="compact"
                initialValues={{ destination: city.name }}
              />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          {/* Access status */}
          {userId && !hasAccess && allDeals.length > FREE_DEAL_LIMIT && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm text-amber-800">
                Showing <strong>{FREE_DEAL_LIMIT}</strong> of{" "}
                <strong>{allDeals.length}</strong> deals. Subscribe to{" "}
                {city.name} to unlock all.
              </p>
              <Link href={`/premium?city=${city.slug}`}>
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Crown className="h-3.5 w-3.5" />
                  Unlock
                </Button>
              </Link>
            </div>
          )}

          {/* Deals grid */}
          {allDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <MapPin className="h-12 w-12 text-gray-300 mb-4" />
              <h2 className="text-lg font-semibold text-gray-700">
                No active deals in {city.name} right now
              </h2>
              <p className="mt-2 text-gray-500">
                Check back soon — deals are updated daily.
              </p>
              <Link href="/search" className="mt-4">
                <Button variant="outline">Search all cities</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {visibleDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    hotel={{ ...deal.hotel, city }}
                    isBlurred={false}
                    variant="list"
                  />
                ))}
              </div>

              {/* Subscription gate for free users */}
              {!hasAccess && hiddenCount > 0 && (
                <Suspense>
                  <CitySubscriptionGate
                    cityName={city.name}
                    citySlug={city.slug}
                    totalDeals={allDeals.length}
                    visibleDeals={visibleDeals.length}
                  />
                </Suspense>
              )}
            </>
          )}
          {/* LiteAPI live booking widgets */}
          {CITY_PLACE_IDS[citySlug] && (
            <div className="mt-10 space-y-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Book Live — {city.name} Hotels
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Real-time availability and instant booking powered by LiteAPI
                </p>
                <LiteAPIHotelsListWidget
                  placeId={CITY_PLACE_IDS[citySlug]}
                  instanceId={citySlug}
                  hasSearchBar={false}
                  rows={8}
                  currency="CAD"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Map View
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Explore hotels in {city.name} on the map
                </p>
                <div className="overflow-hidden rounded-2xl border border-gray-200">
                  <LiteAPIMapWidget
                    placeId={CITY_PLACE_IDS[citySlug]}
                    instanceId={citySlug}
                    height="480px"
                    currency="CAD"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
