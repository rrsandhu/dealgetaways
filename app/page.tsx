import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Bell, TrendingDown, Shield, Crown, Star } from "lucide-react";
import { SearchBar } from "@/components/search/search-bar";
import { FlashDealsCarousel } from "@/components/deals/flash-deals-carousel";
import { DealCard } from "@/components/hotel/deal-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getAllCities,
  getFlashDeals,
  getLastMinuteDeals,
  getTopDeals,
  getCityDealCounts,
} from "@/lib/supabase/queries";

// Hardcoded city images for the popular cities grid
const CITY_IMAGES: Record<string, string> = {
  "toronto-downtown":
    "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=600&q=80",
  "vancouver-downtown":
    "https://images.unsplash.com/photo-1560814304-4f05b62af116?w=600&q=80",
  "montreal-downtown":
    "https://images.unsplash.com/photo-1519178614-68673b201f36?w=600&q=80",
  "calgary-downtown":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  banff: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80",
  whistler:
    "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80",
  "niagara-falls":
    "https://images.unsplash.com/photo-1489447068241-b3490214e879?w=600&q=80",
  "quebec-city":
    "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&q=80",
  "victoria-bc":
    "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&q=80",
  halifax:
    "https://images.unsplash.com/photo-1531071535471-e3c78b5ab84b?w=600&q=80",
  kelowna:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  canmore:
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
};

export default async function HomePage() {
  // Fetch real data — parallel
  const [cities, flashDeals, lastMinuteDeals, topDeals, dealCounts] =
    await Promise.all([
      getAllCities().catch(() => []),
      getFlashDeals(12).catch(() => []),
      getLastMinuteDeals(8).catch(() => []),
      getTopDeals(8).catch(() => []),
      getCityDealCounts().catch(() => ({})),
    ]);

  // Map city id → deal count
  const citiesWithCounts = cities.map((city) => ({
    ...city,
    dealCount: dealCounts[city.id] ?? 0,
  }));

  const featuredCities = citiesWithCounts
    .filter((c) => c.dealCount > 0)
    .sort((a, b) => b.dealCount - a.dealCount)
    .slice(0, 12);

  return (
    <div className="bg-white">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-blue-900 py-16 lg:py-24">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              🍁 929+ Real Canadian Hotel Deals Updated Daily
            </span>
          </div>

          <h1 className="text-center text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find Incredible Hotel Deals
            <br />
            <span className="text-amber-300">Across Canada</span>
          </h1>

          <p className="mt-4 text-center text-lg leading-relaxed text-blue-100">
            Real prices. Real savings. 24 Canadian cities covered.
          </p>

          <div className="mt-8">
            <SearchBar variant="hero" />
          </div>

          {/* Quick city pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {["toronto-downtown", "vancouver-downtown", "banff", "whistler", "montreal-downtown"].map(
              (slug) => {
                const city = cities.find((c) => c.slug === slug);
                if (!city) return null;
                return (
                  <Link key={slug} href={`/deals/${slug}`}>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white hover:bg-white/25 transition-colors cursor-pointer">
                      {city.name}
                    </span>
                  </Link>
                );
              }
            )}
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-6 text-center">
            {[
              { value: "929+", label: "Live deals" },
              { value: "24", label: "Canadian cities" },
              { value: "38%", label: "Avg. savings" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-black text-white">{s.value}</div>
                <div className="text-sm text-blue-200">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Deal tabs ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Tabs defaultValue="top">
          <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <TabsList className="h-11">
              <TabsTrigger value="top">Top Deals</TabsTrigger>
              <TabsTrigger value="flash">Flash Deals</TabsTrigger>
              <TabsTrigger value="lastminute">Last Minute</TabsTrigger>
            </TabsList>
            <Link
              href="/search"
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
            >
              View all deals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <TabsContent value="top">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {topDeals.slice(0, 4).map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  hotel={deal.hotel}
                  isBlurred={false}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="flash">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {flashDeals.slice(0, 4).map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  hotel={deal.hotel}
                  isBlurred={false}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lastminute">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {lastMinuteDeals.slice(0, 4).map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  hotel={deal.hotel}
                  isBlurred={false}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Flash deals carousel */}
        <FlashDealsCarousel deals={flashDeals} />

        {/* Popular Cities Grid */}
        <section className="py-10 border-t border-gray-100">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                24 Canadian Cities
              </h2>
              <p className="text-sm text-gray-500">
                Click a city to see all current deals
              </p>
            </div>
            <Link href="/cities">
              <Button variant="outline" size="sm">
                All cities <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {citiesWithCounts.map((city) => {
              const img = CITY_IMAGES[city.slug];
              return (
                <Link
                  key={city.id}
                  href={`/deals/${city.slug}`}
                  className="group relative overflow-hidden rounded-2xl aspect-[3/4] shadow-sm hover:shadow-md transition-shadow"
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
                    <div className="h-full w-full bg-gradient-to-br from-blue-600 to-blue-800" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-sm font-bold leading-tight text-white">
                      {city.name}
                    </p>
                    {city.dealCount > 0 && (
                      <p className="text-xs text-blue-300 mt-0.5">
                        {city.dealCount} deals
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Luxury Deals */}
        <section className="py-10 border-t border-gray-100">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Top Deals Right Now
                </h2>
                <p className="text-sm text-gray-500">
                  Highest savings across Canada
                </p>
              </div>
            </div>
            <Link href="/search?sortBy=best_deals">
              <Button variant="outline" size="sm">
                See all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topDeals.slice(4, 8).map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                hotel={deal.hotel}
                isBlurred={false}
              />
            ))}
          </div>
        </section>

        {/* Premium CTA */}
        <section className="py-10">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-800 to-blue-950 p-8 lg:p-12">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Crown className="h-6 w-6 text-amber-400" />
                  <Badge className="bg-amber-400/20 text-amber-300 border-amber-400/30">
                    Premium — From $9.99/month
                  </Badge>
                </div>
                <h2 className="text-3xl font-black text-white lg:text-4xl">
                  Never Miss a Deal Again
                </h2>
                <p className="mt-3 text-blue-200">
                  Subscribe to your favourite Canadian cities. Get real-time
                  alerts when prices drop. Unlock all 929+ deals.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/premium">
                    <Button
                      className="bg-amber-500 text-white hover:bg-amber-600 shadow-lg"
                      size="lg"
                    >
                      <Crown className="h-4 w-4" />
                      Upgrade to Premium
                    </Button>
                  </Link>
                  <Link href="/cities">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                    >
                      Browse cities free
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Zap, title: "All Flash Deals", desc: "First access to expiring deals" },
                  { icon: Bell, title: "Deal Alerts", desc: "Email when prices drop" },
                  { icon: TrendingDown, title: "Price History", desc: "See if it's really a deal" },
                  { icon: Shield, title: "City Access", desc: "Full deals for subscribed cities" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="rounded-2xl bg-white/10 p-4 backdrop-blur"
                  >
                    <Icon className="h-6 w-6 text-amber-400 mb-2" />
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="text-xs text-blue-200 mt-0.5">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-10 border-t border-gray-100">
          <div className="rounded-2xl bg-gray-100 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Get the Best Canadian Hotel Deals Weekly
            </h2>
            <p className="mt-2 text-gray-600">
              The top 5 deals across Canada, every week. No spam.
            </p>
            <form
              className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
              action="/api/newsletter"
              method="POST"
            >
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                required
                className="h-11 w-full max-w-sm rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 sm:w-72"
              />
              <Button
                type="submit"
                className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800"
              >
                Subscribe Free
              </Button>
            </form>
            <p className="mt-3 text-xs text-gray-500">
              Join 12,000+ Canadians saving on hotels. Unsubscribe anytime.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
