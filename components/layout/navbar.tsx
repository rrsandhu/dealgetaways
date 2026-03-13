"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MapPin, Zap, Clock, Crown, Menu, X, ChevronDown } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import type { DbCity } from "@/types";

interface NavbarProps {
  cities?: DbCity[];
}

export function Navbar({ cities = [] }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [citiesOpen, setCitiesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full" style={{ backgroundColor: '#2F7C9C' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.svg"
              alt="DealGetaways"
              width={160}
              height={44}
              className="h-10 w-auto rounded-md"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            <Link
              href="/search"
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith("/search")
                  ? "bg-white/20 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <Zap className="h-4 w-4" />
              Deals
            </Link>

            <div className="relative">
              <button
                onClick={() => setCitiesOpen(!citiesOpen)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <MapPin className="h-4 w-4" />
                Cities
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", citiesOpen && "rotate-180")} />
              </button>
              {citiesOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setCitiesOpen(false)} />
                  <div className="absolute left-0 top-full z-20 mt-1.5 w-64 rounded-xl border border-gray-100 bg-white p-2 shadow-2xl">
                    <div className="grid grid-cols-2 gap-0.5 max-h-72 overflow-y-auto">
                      {cities.map((city) => (
                        <Link
                          key={city.id}
                          href={`/deals/${city.slug}`}
                          className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-[#2F7C9C] transition-colors"
                          onClick={() => setCitiesOpen(false)}
                        >
                          {city.name}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-1 border-t border-gray-100 pt-1">
                      <Link href="/cities" className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-[#2F7C9C] hover:bg-sky-50" onClick={() => setCitiesOpen(false)}>
                        View all 24 cities →
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link
              href="/deals/flash"
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/deals/flash"
                  ? "bg-white/20 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <Zap className="h-4 w-4" />
              Flash
            </Link>

            <Link
              href="/deals/last-minute"
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/deals/last-minute"
                  ? "bg-white/20 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <Clock className="h-4 w-4" />
              Last Minute
            </Link>

            <Link
              href="/premium"
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/premium"
                  ? "bg-white/20 text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <Crown className="h-4 w-4" />
              Premium
            </Link>
          </nav>

          {/* Auth + Mobile Toggle */}
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: '#E76D38' }}
                >
                  Get Started
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white/90 hover:bg-white/10 transition-colors"
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>

            <button
              className="rounded-lg p-2 text-white/80 hover:bg-white/10 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#2F7C9C] pb-4 md:hidden">
          <nav className="flex flex-col gap-0.5 px-4 pt-3">
            {[
              { href: "/search", label: "All Deals", icon: Zap },
              { href: "/cities", label: "Cities", icon: MapPin },
              { href: "/deals/flash", label: "Flash Deals", icon: Zap },
              { href: "/deals/last-minute", label: "Last Minute", icon: Clock },
              { href: "/premium", label: "Premium", icon: Crown },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
              <SignedOut>
                <Link href="/sign-in" className="rounded-xl border border-white/30 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-white/10" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link href="/sign-up" className="rounded-xl px-4 py-2.5 text-center text-sm font-bold text-white" style={{ backgroundColor: '#E76D38' }} onClick={() => setMobileOpen(false)}>
                  Get Started Free
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="rounded-xl border border-white/30 px-4 py-2.5 text-center text-sm font-medium text-white" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
              </SignedIn>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
