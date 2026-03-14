"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  /** Either a Date object or a YYYY-MM-DD string */
  minDate?: Date | string;
  className?: string;
  /** Use white text on dark/transparent background */
  darkMode?: boolean;
}

export function DatePicker({ value, onChange, label, placeholder = "Select date", minDate, className, darkMode }: DatePickerProps) {
  const minDateObj = typeof minDate === "string" ? new Date(minDate + "T12:00:00") : minDate;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Parse without timezone shift
  const selected = value ? new Date(value + "T12:00:00") : undefined;

  const formatted = selected
    ? selected.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })
    : null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      onChange(`${y}-${m}-${d}`);
    }
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={
          darkMode
            ? `w-full h-12 text-left px-4 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm text-sm font-medium transition-all hover:bg-white/20 ${formatted ? "text-white" : "text-white/50"}`
            : "w-full text-left"
        }
      >
        {!darkMode && label && <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>}
        {!darkMode && (
          <div className={`text-sm font-medium ${formatted ? "text-slate-800" : "text-slate-400"}`}>
            {formatted ?? placeholder}
          </div>
        )}
        {darkMode && <span>{formatted ?? placeholder}</span>}
      </button>

      {open && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            className="
              fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[min(340px,90vw)]
              rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl
              md:absolute md:left-0 md:top-full md:translate-x-0 md:translate-y-0
              md:fixed-none md:mt-2 md:w-auto
            "
          >
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              disabled={minDateObj ? { before: minDateObj } : { before: new Date() }}
              startMonth={minDateObj ?? new Date()}
              components={{
                Chevron: ({ orientation }) =>
                  orientation === "left"
                    ? <ChevronLeft className="h-4 w-4" />
                    : <ChevronRight className="h-4 w-4" />,
              }}
              classNames={{
                root: "font-sans select-none",
                month_caption: "flex items-center justify-between py-1 mb-3 px-1",
                caption_label: "text-sm font-bold text-gray-900",
                nav: "flex items-center gap-1",
                button_previous: "p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors",
                button_next: "p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors",
                month_grid: "w-full border-collapse",
                weekdays: "flex mb-1",
                weekday: "text-gray-400 text-xs font-medium w-10 text-center pb-1",
                week: "flex",
                day: "w-10 h-10 p-0 text-center",
                day_button: "w-10 h-10 text-sm rounded-xl hover:bg-sky-50 transition-colors font-medium text-gray-700 flex items-center justify-center",
                selected: "!bg-[#2F7C9C] !text-white hover:!bg-[#1f5a73] rounded-xl",
                today: "font-bold text-[#2F7C9C]",
                outside: "opacity-30",
                disabled: "opacity-20 cursor-not-allowed",
                hidden: "invisible",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
