"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  initialValues?: {
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };
  variant?: "hero" | "compact";
}

export function SearchBar({
  className,
  initialValues,
  variant = "hero",
}: SearchBarProps) {
  const router = useRouter();
  const [destination, setDestination] = useState(
    initialValues?.destination ?? ""
  );
  const [checkIn, setCheckIn] = useState(initialValues?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(initialValues?.checkOut ?? "");
  const [guests, setGuests] = useState(initialValues?.guests ?? 2);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", guests.toString());
    router.push(`/search?${params.toString()}`);
  };

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm",
          className
        )}
      >
        <div className="flex flex-1 items-center gap-2 px-3">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="City or destination..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </div>
        <Button size="sm" onClick={handleSearch} className="shrink-0">
          Search
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-white/10",
        className
      )}
    >
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Destination */}
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors cursor-text">
          <MapPin className="h-5 w-5 shrink-0 text-blue-600" />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Destination
            </label>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Toronto, Banff..."
              className="mt-0.5 block w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Check-in */}
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors">
          <Calendar className="h-5 w-5 shrink-0 text-blue-600" />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Check-in
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="mt-0.5 block w-full bg-transparent text-sm font-medium text-gray-900 outline-none"
            />
          </div>
        </div>

        {/* Check-out */}
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors">
          <Calendar className="h-5 w-5 shrink-0 text-blue-600" />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Check-out
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="mt-0.5 block w-full bg-transparent text-sm font-medium text-gray-900 outline-none"
            />
          </div>
        </div>

        {/* Guests + Search */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors">
            <Users className="h-5 w-5 shrink-0 text-blue-600" />
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="mt-0.5 block w-full bg-transparent text-sm font-medium text-gray-900 outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "guest" : "guests"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={handleSearch}
            className="h-14 w-14 shrink-0 rounded-xl p-0 bg-blue-600 hover:bg-blue-700"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
