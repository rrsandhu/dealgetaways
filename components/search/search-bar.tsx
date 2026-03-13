"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  initialValues?: {
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };
  variant?: "hero" | "compact" | "pill";
}

export function SearchBar({ className, initialValues, variant = "hero" }: SearchBarProps) {
  const router = useRouter();
  const [destination, setDestination] = useState(initialValues?.destination ?? "");
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

  if (variant === "pill") {
    return (
      <div className={cn("bg-white rounded-full p-2 flex flex-col md:flex-row items-center shadow-2xl text-slate-800 max-w-5xl mx-auto gap-1", className)}>
        <div className="flex-1 flex items-center gap-3 px-5 py-3 hover:bg-slate-50 rounded-full cursor-text w-full">
          <MapPin className="shrink-0 text-blue-500" size={20} />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destination</div>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Toronto, Banff..."
              className="w-full bg-transparent outline-none font-medium text-sm placeholder-slate-300 text-slate-800"
            />
          </div>
        </div>

        <div className="hidden md:block w-px h-8 bg-slate-200 shrink-0" />

        <div className="flex-1 flex items-center gap-3 px-5 py-3 hover:bg-slate-50 rounded-full cursor-pointer w-full">
          <Calendar className="shrink-0 text-blue-500" size={20} />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-in</div>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent outline-none font-medium text-sm text-slate-800"
            />
          </div>
        </div>

        <div className="hidden md:block w-px h-8 bg-slate-200 shrink-0" />

        <div className="flex-1 flex items-center gap-3 px-5 py-3 hover:bg-slate-50 rounded-full cursor-pointer w-full">
          <Calendar className="shrink-0 text-blue-500" size={20} />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-out</div>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent outline-none font-medium text-sm text-slate-800"
            />
          </div>
        </div>

        <div className="hidden md:block w-px h-8 bg-slate-200 shrink-0" />

        <div className="flex-1 flex items-center gap-3 px-5 py-3 hover:bg-slate-50 rounded-full cursor-pointer w-full">
          <Users className="shrink-0 text-blue-500" size={20} />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guests</div>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full bg-transparent outline-none font-medium text-sm text-slate-800"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full transition-colors w-full md:w-auto flex justify-center shadow-md shrink-0"
        >
          <Search size={22} />
        </button>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm", className)}>
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
        <button
          onClick={handleSearch}
          className="shrink-0 rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#E76D38' }}
        >
          Search
        </button>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl bg-white p-2 shadow-2xl", className)}>
      <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
        {/* Destination */}
        <div className="flex items-center gap-3 rounded-xl px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-text">
          <MapPin className="h-5 w-5 shrink-0" style={{ color: '#2F7C9C' }} />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: '#2F7C9C' }}>
              Destination
            </label>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Toronto, Banff, Vancouver..."
              className="mt-0.5 block w-full bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Check-in */}
        <div className="flex items-center gap-3 rounded-xl px-4 py-3.5 hover:bg-gray-50 transition-colors border-t sm:border-t-0 sm:border-l border-gray-100">
          <Calendar className="h-5 w-5 shrink-0" style={{ color: '#2F7C9C' }} />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: '#2F7C9C' }}>
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
        <div className="flex items-center gap-3 rounded-xl px-4 py-3.5 hover:bg-gray-50 transition-colors border-t sm:border-t-0 sm:border-l border-gray-100">
          <Calendar className="h-5 w-5 shrink-0" style={{ color: '#2F7C9C' }} />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: '#2F7C9C' }}>
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

        {/* Guests + Search button */}
        <div className="flex items-center gap-2 border-t lg:border-t-0 lg:border-l border-gray-100">
          <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3.5 hover:bg-gray-50 transition-colors">
            <Users className="h-5 w-5 shrink-0" style={{ color: '#2F7C9C' }} />
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: '#2F7C9C' }}>
                Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="mt-0.5 block w-full bg-transparent text-sm font-medium text-gray-900 outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="h-14 w-14 shrink-0 rounded-xl text-white transition-all hover:opacity-90 active:scale-95 flex items-center justify-center"
            style={{ backgroundColor: '#E76D38' }}
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
