"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MapPin, Zap, Clock, Crown, Menu, X, ChevronDown } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
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
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-black tracking-tight text-gray-900">
                Deal<span className="text-blue-700">Getaways</span>
              </span>
              <span className="block text-[10px] font-medium tracking-wide text-gray-400 -mt-1">
                Canada&apos;s Best Hotel Deals
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/search"
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith("/search")
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Zap className="h-4 w-4" />
              Deals
            </Link>

            {/* Cities dropdown */}
            <div className="relative">
              <button
                onClick={() => setCitiesOpen(!citiesOpen)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <MapPin className="h-4 w-4" />
                Cities
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", citiesOpen && "rotate-180")} />
              </button>

              {citiesOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setCitiesOpen(false)} />
                  <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                    <div className="grid grid-cols-2 gap-0.5 max-h-72 overflow-y-auto">
                      {cities.map((city) => (
                        <Link
                          key={city.id}
                          href={`/deals/${city.slug}`}
                          className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          onClick={() => setCitiesOpen(false)}
                        >
                          {city.name}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-1 border-t border-gray-100 pt-1">
                      <Link
                        href="/cities"
                        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                        onClick={() => setCitiesOpen(false)}
                      >
                        View all cities →
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
                  ? "bg-orange-50 text-orange-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              Flash Deals
            </Link>

            <Link
              href="/deals/last-minute"
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/deals/last-minute"
                  ? "bg-red-50 text-red-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
                  ? "bg-amber-50 text-amber-700"
                  : "text-amber-600 hover:bg-amber-50 hover:text-amber-700"
              )}
            >
              <Crown className="h-4 w-4" />
              Premium
            </Link>
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <SignedOut>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Get Started</Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>

            <button
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white pb-4 md:hidden">
          <nav className="flex flex-col gap-1 px-4 pt-3">
            {[
              { href: "/search", label: "Deals", icon: Zap },
              { href: "/cities", label: "All Cities", icon: MapPin },
              { href: "/deals/flash", label: "Flash Deals", icon: Zap },
              { href: "/deals/last-minute", label: "Last Minute", icon: Clock },
              { href: "/premium", label: "Premium", icon: Crown },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-gray-100 pt-2">
              <SignedOut>
                <Link href="/sign-in">
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="w-full">Get Started Free</Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">Dashboard</Button>
                </Link>
              </SignedIn>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
