"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { LITEAPI_DOMAIN, LITEAPI_BRAND_COLOR, LITEAPI_SDK_URL } from "@/lib/liteapi";

interface LiteAPISearchWidgetProps {
  /** Override the domain from env */
  domain?: string;
  primaryColor?: string;
  className?: string;
  /** Preset check-in date YYYY-MM-DD */
  checkIn?: string;
  /** Preset check-out date YYYY-MM-DD */
  checkOut?: string;
}

export function LiteAPISearchWidget({
  domain = LITEAPI_DOMAIN,
  primaryColor = LITEAPI_BRAND_COLOR,
  className,
  checkIn,
  checkOut,
}: LiteAPISearchWidgetProps) {
  const initialized = useRef(false);

  const initWidget = () => {
    if (initialized.current || !window.LiteAPI || !domain) return;
    initialized.current = true;

    window.LiteAPI.init({ domain });
    window.LiteAPI.SearchBar.create({
      selector: "#liteapi-search-widget",
      primaryColor,
      ...(checkIn || checkOut
        ? { deepLinkParams: { ...(checkIn && { checkin: checkIn }), ...(checkOut && { checkout: checkOut }) } }
        : {}),
    });
  };

  useEffect(() => {
    // Script may already be loaded (e.g. navigating back)
    if (window.LiteAPI) initWidget();
  }, []);

  if (!domain) {
    return (
      <div className={className}>
        <div className="rounded-2xl border border-dashed border-white/30 bg-white/10 px-6 py-4 text-center text-white/70 text-sm">
          Set <code className="font-mono text-white/90">NEXT_PUBLIC_LITEAPI_DOMAIN</code> to enable live search
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Script
        src={LITEAPI_SDK_URL}
        strategy="afterInteractive"
        onLoad={initWidget}
      />
      <div id="liteapi-search-widget" style={{ width: "100%" }} />
    </div>
  );
}
