import Link from "next/link";
import { MapPin, Mail } from "lucide-react";
import type { DbCity } from "@/types";

interface FooterProps {
  cities?: DbCity[];
}

export function Footer({ cities = [] }: FooterProps) {
  const topCities = cities.slice(0, 8);

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-gray-900">
                  Deal<span className="text-blue-700">Getaways</span>
                </span>
                <span className="block text-[10px] font-medium tracking-wide text-gray-400 -mt-0.5">
                  Canada&apos;s Best Hotel Deals
                </span>
              </div>
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              Canada&apos;s best hotel deals platform. Real prices from 929+
              deals across 24 Canadian cities — updated daily.
            </p>
            <a
              href="mailto:hello@dealgetaways.com"
              className="mt-3 flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600"
            >
              <Mail className="h-4 w-4" />
              hello@dealgetaways.com
            </a>
          </div>

          {/* Deals */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Deals</h3>
            <ul className="mt-3 space-y-2">
              {[
                { label: "Search All Deals", href: "/search" },
                { label: "Flash Deals", href: "/deals/flash" },
                { label: "Last Minute", href: "/deals/last-minute" },
                { label: "Premium Access", href: "/premium" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-blue-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Top Cities</h3>
            <ul className="mt-3 space-y-2">
              {topCities.map((city) => (
                <li key={city.id}>
                  <Link
                    href={`/deals/${city.slug}`}
                    className="text-sm text-gray-500 hover:text-blue-600"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/cities"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  All 24 cities →
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Account</h3>
            <ul className="mt-3 space-y-2">
              {[
                { label: "Sign Up Free", href: "/sign-up" },
                { label: "Sign In", href: "/sign-in" },
                { label: "Dashboard", href: "/dashboard" },
                { label: "Alerts", href: "/alerts" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-blue-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 sm:flex-row">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} DealGetaways. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Prices in CAD. Deals subject to availability. Not affiliated with
            hotels shown.
          </p>
        </div>
      </div>
    </footer>
  );
}
