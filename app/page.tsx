import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Bell, TrendingDown, Shield, Crown, Star, MapPin, Users, CheckCircle, Map, PiggyBank } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { SearchBar } from "@/components/search/search-bar";
import { FlashDealsCarousel } from "@/components/deals/flash-deals-carousel";
import { DestinationCarousel } from "@/components/deals/destination-carousel";
import { DealCard } from "@/components/hotel/deal-card";
import {
  getAllCities,
  getFlashDeals,
  getLastMinuteDeals,
  getTopDeals,
  getCityDealCounts,
} from "@/lib/supabase/queries";

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
};

const POPULAR_CITY_SLUGS = ["toronto-downtown", "vancouver-downtown", "banff", "montreal-downtown", "whistler", "quebec-city"];

export default async function HomePage() {
  const [cities, flashDeals, lastMinuteDeals, topDeals, dealCounts] = await Promise.all([
    getAllCities().catch(() => []),
    getFlashDeals(12).catch(() => []),
    getLastMinuteDeals(8).catch(() => []),
    getTopDeals(48).catch(() => []),
    getCityDealCounts().catch(() => ({} as Record<string, number>)),
  ]);

  // Group top deals by city for destination carousels
  type TopDeal = (typeof topDeals)[number];
  const dealsByCity: Record<string, TopDeal[]> = {};
  for (const deal of topDeals) {
    const slug = deal.hotel.city?.slug ?? "other";
    if (!dealsByCity[slug]) dealsByCity[slug] = [];
    if (dealsByCity[slug].length < 8) dealsByCity[slug].push(deal);
  }

  // Pick top 4 cities that have enough deals
  const citiesWithCounts = cities.map((c) => ({ ...c, dealCount: dealCounts[c.id] ?? 0 }));
  const carouselCities = citiesWithCounts
    .filter((c) => (dealsByCity[c.slug]?.length ?? 0) >= 3)
    .sort((a, b) => b.dealCount - a.dealCount)
    .slice(0, 4);

  const featuredCities = citiesWithCounts
    .filter((c) => POPULAR_CITY_SLUGS.includes(c.slug))
    .sort((a, b) => POPULAR_CITY_SLUGS.indexOf(a.slug) - POPULAR_CITY_SLUGS.indexOf(b.slug));

  // Top 4 for "Trending Now" grid, next 4 blurred for premium teaser
  const trendingDeals = topDeals.slice(0, 4);
  const premiumTeaserDeals = topDeals.slice(4, 8);

  return (
    <div className="bg-white">

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden flex flex-col" style={{ minHeight: 'calc(100vh - 64px)' }}>
        {/* Background photo + overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero.png')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-teal-900/60 to-slate-900/95" />
        </div>

        <div className="relative z-10 flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-14 pb-10 flex flex-col">

          {/* Two-column grid — deal card hidden on mobile, shown from lg */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center flex-1">

            {/* Left: Headline */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-sm font-medium text-blue-100">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6FAFD0] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                🍁 929+ Real Canadian Hotel Deals · Updated Daily
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white">
                Unlock Canada&apos;s Hidden Hotel Gems at Unbeatable Prices.
              </h1>
              <p className="text-lg md:text-xl text-blue-100/90 md:pr-12">
                Find verified deals from Whistler to Montreal.<br className="hidden md:block" />
                Save an average of 38%.
              </p>
            </div>

            {/* Right: Floating deal card — hidden on mobile */}
            {trendingDeals[0] && (
              <div className="hidden lg:block lg:col-span-5">
                <Link href={`/hotels/${trendingDeals[0].hotel_id}`}>
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-4 shadow-2xl shadow-black/50 hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
                    {trendingDeals[0].hotel.image_url ? (
                      <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-4">
                        <Image
                          src={trendingDeals[0].hotel.image_url}
                          alt={trendingDeals[0].hotel.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 rounded-2xl mb-4 bg-gradient-to-br from-[#2F7C9C] to-[#1f5a73]" />
                    )}
                    <div className="px-2">
                      <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
                        {trendingDeals[0].hotel.name}
                      </h3>
                      {trendingDeals[0].hotel.city && (
                        <p className="text-white/60 text-sm mb-3">{trendingDeals[0].hotel.city.name}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300 line-through text-sm">
                              {formatCurrency(trendingDeals[0].original_price)}
                            </span>
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2 py-1 rounded-full">
                              🍁 Save {Math.round(trendingDeals[0].savings_percent)}%
                            </span>
                          </div>
                          <div className="text-3xl font-extrabold text-white mt-1">
                            {formatCurrency(trendingDeals[0].deal_price)}
                            <span className="text-lg font-medium text-gray-300">/night</span>
                          </div>
                        </div>
                        <div className="bg-white text-slate-900 px-5 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg text-sm">
                          View Deal
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Pill search bar */}
          <div className="mt-12">
            <SearchBar variant="pill" />
          </div>

          {/* City chips */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {POPULAR_CITY_SLUGS.map((slug) => {
              const city = cities.find((c) => c.slug === slug);
              if (!city) return null;
              return (
                <Link key={slug} href={`/deals/${slug}`}>
                  <span className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white text-sm px-4 py-2 transition-colors cursor-pointer">
                    {city.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Trust stats */}
          <div className="grid grid-cols-3 gap-4 mt-10 text-center max-w-4xl mx-auto border-t border-white/10 pt-8">
            {[
              { value: "929+", label: "Live deals", badge: <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-sm text-white"><CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Verified</span> },
              { value: "24", label: "Canadian cities", badge: <div className="bg-white/10 p-2 rounded-full inline-block"><Map className="h-5 w-5 text-blue-300" /></div> },
              { value: "38%", label: "Avg. savings", badge: <div className="bg-white/10 p-2 rounded-full inline-block"><PiggyBank className="h-5 w-5 text-pink-300" /></div> },
            ].map(({ value, label, badge }) => (
              <div key={label} className="flex flex-col items-center justify-center space-y-2">
                <div className="text-4xl font-extrabold text-white">{value}</div>
                <div className="text-blue-100">{label}</div>
                {badge}
              </div>
            ))}
          </div>

        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── TRENDING DEALS ───────────────────────────────────────────────── */}
        <section className="py-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Trending Deals Right Now</h2>
              <p className="text-sm text-gray-500 mt-0.5">Highest savings across Canada today</p>
            </div>
            <Link href="/search?sortBy=best_deals" className="flex items-center gap-1 text-sm font-semibold hover:underline" style={{ color: '#2F7C9C' }}>
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trendingDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} hotel={deal.hotel} isBlurred={false} />
            ))}
          </div>
        </section>

        {/* ── FLASH DEALS CAROUSEL ─────────────────────────────────────────── */}
        {flashDeals.length > 0 && (
          <div className="border-t border-gray-100">
            <FlashDealsCarousel deals={flashDeals} />
          </div>
        )}

        {/* ── DESTINATION CAROUSELS ────────────────────────────────────────── */}
        {carouselCities.map((city) => {
          const cityDeals = dealsByCity[city.slug] ?? [];
          if (!cityDeals.length) return null;
          return (
            <div key={city.id} className="border-t border-gray-100">
              <DestinationCarousel
                title={`Top Deals in ${city.name}`}
                subtitle={`Best savings in ${city.name}${city.province ? `, ${city.province}` : ""} right now`}
                deals={cityDeals}
                citySlug={city.slug}
              />
            </div>
          );
        })}

        {/* ── PREMIUM TEASER ───────────────────────────────────────────────── */}
        <section className="border-t border-gray-100 py-10">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: '#E76D38' }}>
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Members-Only Deals</h2>
                <p className="text-sm text-gray-500">Exclusive rates for Premium members</p>
              </div>
            </div>
            <Link href="/premium" className="flex items-center gap-1 text-sm font-semibold hover:underline" style={{ color: '#E76D38' }}>
              Unlock all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {premiumTeaserDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} hotel={deal.hotel} isBlurred={true} />
            ))}
          </div>
        </section>

        {/* ── POPULAR CITIES GRID ──────────────────────────────────────────── */}
        <section className="border-t border-gray-100 py-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">24 Canadian Cities</h2>
              <p className="text-sm text-gray-500 mt-0.5">Click any city to see current deals</p>
            </div>
            <Link href="/cities" className="flex items-center gap-1 text-sm font-semibold hover:underline" style={{ color: '#2F7C9C' }}>
              All cities <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {featuredCities.map((city) => {
              const img = CITY_IMAGES[city.slug];
              return (
                <Link key={city.id} href={`/deals/${city.slug}`} className="group relative overflow-hidden rounded-2xl aspect-[3/4] shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                  {img ? (
                    <Image src={img} alt={city.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 640px) 50vw, 16vw" />
                  ) : (
                    <div className="h-full w-full" style={{ background: 'linear-gradient(135deg, #2F7C9C 0%, #1f5a73 100%)' }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-sm font-bold leading-tight text-white">{city.name}</p>
                    {city.dealCount > 0 && <p className="text-xs mt-0.5" style={{ color: '#6FAFD0' }}>{city.dealCount} deals</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section className="border-t border-gray-100 py-12">
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">How It Works</h2>
          <p className="mb-10 text-center text-gray-500">Find and book incredible Canadian hotel deals in 3 steps</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { step: "01", icon: "🔍", title: "Search", desc: "Enter your destination and dates. We search 929+ live deals across 24 Canadian cities." },
              { step: "02", icon: "⚡", title: "Compare Deals", desc: "See real-time prices, savings percentages, and reviews. Filter by city, stars, and budget." },
              { step: "03", icon: "🏨", title: "Book for Less", desc: "Click View Deal to book directly at the best available rate. No hidden fees." },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm text-center">
                <div className="mb-4 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-2xl" style={{ backgroundColor: '#e8f4fa' }}>
                  {icon}
                </div>
                <div className="absolute -top-3 left-5 rounded-full px-2 py-0.5 text-xs font-black text-white" style={{ backgroundColor: '#2F7C9C' }}>{step}</div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── LAST MINUTE ──────────────────────────────────────────────────── */}
        {lastMinuteDeals.length > 0 && (
          <div className="border-t border-gray-100">
            <FlashDealsCarousel
              deals={lastMinuteDeals}
              title="Last Minute Deals"
              subtitle="Check-in within 7 days — biggest discounts"
            />
          </div>
        )}

      </div>

      {/* ── ORANGE CTA BANNER ────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#E76D38' }} className="py-14 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <Bell className="mx-auto mb-4 h-10 w-10 text-white/80" />
          <h2 className="text-3xl font-black text-white lg:text-4xl">Never Miss a Hotel Deal</h2>
          <p className="mt-3 text-lg text-white/80">
            Get email alerts the moment prices drop for your favourite Canadian cities.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/premium">
              <button className="rounded-xl bg-white px-8 py-3.5 text-base font-bold transition-all hover:bg-white/90 active:scale-95" style={{ color: '#E76D38' }}>
                Get Deal Alerts
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="rounded-xl border-2 border-white/40 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-colors">
                Sign Up Free
              </button>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-white/70">
            {["Free to join", "Cancel anytime", "Real deals only"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #1f5a73 0%, #2F7C9C 100%)' }} className="py-12 px-4">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-xl font-bold text-white">Get the Best Deals Weekly</h2>
          <p className="mt-1 text-white/70 text-sm">Top 5 Canadian hotel deals, every week. No spam.</p>
          <form className="mt-6 flex flex-col gap-3 sm:flex-row" action="/api/newsletter" method="POST">
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              className="h-12 flex-1 rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/50 outline-none focus:bg-white/20 backdrop-blur-sm"
            />
            <button type="submit" className="h-12 shrink-0 rounded-xl px-6 text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: '#E76D38' }}>
              Subscribe Free
            </button>
          </form>
          <p className="mt-3 text-xs text-white/50">Join 12,000+ Canadians. Unsubscribe anytime.</p>
        </div>
      </section>

    </div>
  );
}
