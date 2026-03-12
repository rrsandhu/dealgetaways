import Link from "next/link";
import { Lock, Crown, Zap, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CitySubscriptionGateProps {
  cityName: string;
  citySlug: string;
  totalDeals: number;
  visibleDeals: number;
}

export function CitySubscriptionGate({
  cityName,
  citySlug,
  totalDeals,
  visibleDeals,
}: CitySubscriptionGateProps) {
  const hiddenCount = totalDeals - visibleDeals;

  return (
    <div className="relative mt-4 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-b from-white to-blue-50">
      {/* Blurred preview of more deals */}
      <div className="space-y-3 p-4 blur-[3px] select-none pointer-events-none">
        {Array.from({ length: Math.min(hiddenCount, 3) }).map((_, i) => (
          <div
            key={i}
            className="flex animate-pulse items-center gap-4 rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="h-16 w-24 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
            </div>
            <div className="space-y-1 text-right">
              <div className="h-6 w-20 rounded bg-gray-200" />
              <div className="h-3 w-16 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 px-6 py-10 backdrop-blur-[1px]">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
          <Lock className="h-7 w-7 text-blue-700" />
        </div>

        <h3 className="mt-4 text-center text-xl font-bold text-gray-900">
          {hiddenCount} more deals in {cityName}
        </h3>
        <p className="mt-2 max-w-sm text-center text-sm text-gray-600">
          Subscribe to {cityName} for <strong>$9.99/month</strong> to unlock
          all deals, real-time alerts, and price drop notifications.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs text-gray-600">
          {[
            { icon: Zap, label: "All deals" },
            { icon: Bell, label: "Deal alerts" },
            { icon: Crown, label: "Flash deals" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon className="h-4 w-4 text-blue-600" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href={`/premium?city=${citySlug}`}
          >
            <Button
              className="bg-blue-700 hover:bg-blue-800 shadow-lg"
              size="lg"
            >
              <Crown className="h-4 w-4" />
              Subscribe to {cityName} — $9.99/mo
            </Button>
          </Link>
          <Link href="/premium">
            <Button variant="ghost" size="sm" className="text-gray-500">
              View all plans
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
