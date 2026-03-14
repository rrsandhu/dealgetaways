"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Sparkles, ChevronDown, Plus, Minus } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Place {
  placeId: string;
  displayName: string;
  formattedAddress?: string;
}

interface HotelSearchFormProps {
  initialValues?: {
    mode?: "destination" | "vibe";
    placeId?: string;
    destination?: string;
    aiSearch?: string;
    checkin?: string;
    checkout?: string;
    adults?: number;
  };
  className?: string;
  variant?: "hero" | "compact";
}

export function HotelSearchForm({
  initialValues,
  className,
  variant = "hero",
}: HotelSearchFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"destination" | "vibe">(
    initialValues?.mode ?? "destination"
  );
  const [query, setQuery] = useState(
    mode === "destination" ? (initialValues?.destination ?? "") : (initialValues?.aiSearch ?? "")
  );
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(
    initialValues?.placeId
      ? { placeId: initialValues.placeId, displayName: initialValues.destination ?? "" }
      : null
  );
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [checkin, setCheckin] = useState(initialValues?.checkin ?? "");
  const [checkout, setCheckout] = useState(initialValues?.checkout ?? "");
  const [adults, setAdults] = useState(initialValues?.adults ?? 2);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    setLoadingSuggestions(true);
    try {
      const res = await fetch(`/api/liteapi/places?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.data ?? []);
    } catch { setSuggestions([]); }
    finally { setLoadingSuggestions(false); }
  }, []);

  useEffect(() => {
    if (mode !== "destination") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, mode, fetchSuggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function handleSearch() {
    if (!checkin || !checkout) return;
    const params = new URLSearchParams({
      checkin,
      checkout,
      adults: String(adults),
    });
    if (mode === "destination") {
      if (!selectedPlace) return;
      params.set("placeId", selectedPlace.placeId);
      params.set("destination", selectedPlace.displayName);
    } else {
      if (!query.trim()) return;
      params.set("aiSearch", query.trim());
    }
    router.push(`/hotels?${params.toString()}`);
  }

  const isValid =
    checkin &&
    checkout &&
    (mode === "vibe" ? query.trim().length > 0 : selectedPlace !== null);

  const inputBase =
    "h-12 w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 text-white placeholder:text-white/50 outline-none focus:bg-white/20 focus:border-white/40 transition-all text-sm";
  const inputCompact =
    "h-11 w-full bg-white border border-gray-200 rounded-xl px-4 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#2F7C9C] focus:ring-2 focus:ring-[#2F7C9C]/20 transition-all text-sm";

  const isHero = variant === "hero";

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      {/* Mode toggle */}
      <div className="flex mb-4 gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20 w-fit">
        <button
          onClick={() => { setMode("destination"); setQuery(""); setSelectedPlace(null); }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            mode === "destination"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-white/70 hover:text-white"
          )}
        >
          <MapPin className="h-4 w-4" />
          Search by destination
        </button>
        <button
          onClick={() => { setMode("vibe"); setQuery(""); setSelectedPlace(null); setSuggestions([]); }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            mode === "vibe"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-white/70 hover:text-white"
          )}
        >
          <Sparkles className="h-4 w-4" />
          Search by vibe
        </button>
      </div>

      {/* Search fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">

        {/* Destination / Vibe input */}
        <div className="sm:col-span-2 relative">
          <label className="block text-xs font-semibold text-white/80 mb-1.5 uppercase tracking-wide">
            {mode === "destination" ? "Destination" : "Describe your perfect trip"}
          </label>
          <div className="relative">
            {mode === "destination" ? (
              <>
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedPlace(null);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="City, region, or property…"
                  className={cn(isHero ? inputBase : inputCompact, "pl-9")}
                  autoComplete="off"
                />
                {selectedPlace && (
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                )}
                {/* Suggestions dropdown */}
                {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
                  <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                    {loadingSuggestions ? (
                      <div className="px-4 py-3 text-sm text-gray-500">Searching…</div>
                    ) : (
                      suggestions.slice(0, 6).map((s) => (
                        <button
                          key={s.placeId}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSelectedPlace(s);
                            setQuery(s.displayName);
                            setShowSuggestions(false);
                            setSuggestions([]);
                          }}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                        >
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{s.displayName}</p>
                            {s.formattedAddress && (
                              <p className="text-xs text-gray-500">{s.formattedAddress}</p>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. romantic getaway in Montreal…"
                  className={cn(isHero ? inputBase : inputCompact, "pl-9")}
                />
              </>
            )}
          </div>
        </div>

        {/* Check-in */}
        <div>
          <label className="block text-xs font-semibold text-white/80 mb-1.5 uppercase tracking-wide">
            Check-in
          </label>
          <DatePicker
            value={checkin}
            onChange={setCheckin}
            placeholder="Select date"
            minDate={new Date().toISOString().slice(0, 10)}
            className="w-full"
            darkMode
          />
        </div>

        {/* Check-out */}
        <div>
          <label className="block text-xs font-semibold text-white/80 mb-1.5 uppercase tracking-wide">
            Check-out
          </label>
          <DatePicker
            value={checkout}
            onChange={setCheckout}
            placeholder="Select date"
            minDate={checkin || new Date().toISOString().slice(0, 10)}
            className="w-full"
            darkMode
          />
        </div>

        {/* Guests + Search */}
        <div className="sm:col-span-2 lg:col-span-4 flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          {/* Guests selector */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-white/80 mb-1.5 uppercase tracking-wide">
              Guests
            </label>
            <div className="flex items-center gap-3 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4">
              <button
                onClick={() => setAdults(Math.max(1, adults - 1))}
                className="h-7 w-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <Minus className="h-3.5 w-3.5 text-white" />
              </button>
              <span className="flex-1 text-center text-white font-semibold text-sm">
                {adults} {adults === 1 ? "adult" : "adults"}
              </span>
              <button
                onClick={() => setAdults(Math.min(10, adults + 1))}
                className="h-7 w-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <Plus className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* Search button */}
          <Button
            onClick={handleSearch}
            disabled={!isValid}
            className="h-12 px-8 text-base font-bold bg-[#E76D38] hover:bg-[#c45a2a] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#E76D38]/30"
          >
            <Search className="h-5 w-5 mr-2" />
            Search Hotels
          </Button>
        </div>
      </div>

      {/* Vibe examples */}
      {mode === "vibe" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {["romantic getaway in Banff", "ski resort in Whistler", "business hotel in Toronto", "spa retreat in Quebec City"].map((ex) => (
            <button
              key={ex}
              onClick={() => setQuery(ex)}
              className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 rounded-full px-3 py-1.5 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
