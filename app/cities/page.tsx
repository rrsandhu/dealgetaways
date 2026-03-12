import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { getAllCities, getCityDealCounts } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Hotel Deals in 24 Canadian Cities",
  description:
    "Browse hotel deals in 24 Canadian cities including Toronto, Vancouver, Banff, Whistler, Montréal, and more.",
};

const CITY_IMAGES: Record<string, string> = {
  "toronto-downtown": "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=600&q=80",
  "vancouver-downtown": "https://images.unsplash.com/photo-1560814304-4f05b62af116?w=600&q=80",
  "montreal-downtown": "https://images.unsplash.com/photo-1519178614-68673b201f36?w=600&q=80",
  "calgary-downtown": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  banff: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80",
  whistler: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80",
  "niagara-falls": "https://images.unsplash.com/photo-1489447068241-b3490214e879?w=600&q=80",
  "quebec-city": "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&q=80",
  "victoria-bc": "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&q=80",
  halifax: "https://images.unsplash.com/photo-1531071535471-e3c78b5ab84b?w=600&q=80",
  kelowna: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  canmore: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
  "mont-tremblant": "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80",
  tofino: "https://images.unsplash.com/photo-1505459668311-8dfac7952bf0?w=600&q=80",
  jasper: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
};

export default async function CitiesPage() {
  const [cities, dealCounts] = await Promise.all([
    getAllCities().catch(() => []),
    getCityDealCounts().catch(() => ({})),
  ]);

  const citiesWithCounts = cities.map((city) => ({
    ...city,
    dealCount: dealCounts[city.id] ?? 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-800 to-blue-900 py-12 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-3xl font-black text-white sm:text-4xl">
            24 Canadian Cities
          </h1>
          <p className="mt-2 text-blue-200">
            Find hotel deals in every major Canadian destination
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {citiesWithCounts.map((city) => {
            const img = CITY_IMAGES[city.slug];
            return (
              <Link
                key={city.id}
                href={`/deals/${city.slug}`}
                className="group relative overflow-hidden rounded-2xl aspect-[3/4] shadow-sm hover:shadow-md transition-all"
              >
                {img ? (
                  <Image
                    src={img}
                    alt={city.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-blue-600 to-blue-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-sm font-bold text-white leading-tight">
                    {city.name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1">
                    {city.dealCount > 0 ? (
                      <span className="text-xs text-blue-300">
                        {city.dealCount} deals
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Coming soon</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {cities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MapPin className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">Cities loading...</p>
            <p className="mt-1 text-sm text-gray-400">
              Connect Supabase to see all 24 Canadian cities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
