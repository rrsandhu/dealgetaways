"use client";

import { useEffect, useState } from "react";
import { Clock, Flame } from "lucide-react";
import { timeUntil, cn } from "@/lib/utils";

interface DealUrgencyBannerProps {
  expiresAt: string;
  savingsPercent: number;
  className?: string;
}

export function DealUrgencyBanner({
  expiresAt,
  savingsPercent,
  className,
}: DealUrgencyBannerProps) {
  const [timeLeft, setTimeLeft] = useState(timeUntil(expiresAt));

  useEffect(() => {
    const interval = setInterval(
      () => setTimeLeft(timeUntil(expiresAt)),
      30000
    );
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (timeLeft === "Expired") return null;

  const isUrgent =
    new Date(expiresAt).getTime() - Date.now() < 6 * 60 * 60 * 1000;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border p-4",
        isUrgent
          ? "border-red-200 bg-red-50"
          : "border-orange-200 bg-orange-50",
        className
      )}
    >
      {isUrgent ? (
        <Flame className="h-5 w-5 shrink-0 text-red-500" />
      ) : (
        <Clock className="h-5 w-5 shrink-0 text-orange-500" />
      )}
      <div className="flex-1">
        <p
          className={cn(
            "text-sm font-semibold",
            isUrgent ? "text-red-800" : "text-orange-800"
          )}
        >
          {isUrgent ? "Deal expires very soon!" : "Limited time deal"}
        </p>
        <p
          className={cn(
            "text-xs",
            isUrgent ? "text-red-600" : "text-orange-600"
          )}
        >
          Expires in:{" "}
          <strong className="tabular-nums">{timeLeft}</strong>
        </p>
      </div>
      <div className="text-right">
        <div
          className={cn(
            "text-2xl font-black",
            isUrgent ? "text-red-600" : "text-orange-600"
          )}
        >
          -{Math.round(savingsPercent)}%
        </div>
        <p className="text-xs text-gray-500">off regular</p>
      </div>
    </div>
  );
}
