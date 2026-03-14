"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { LITEAPI_DOMAIN, LITEAPI_BRAND_COLOR, LITEAPI_SDK_URL } from "@/lib/liteapi";

interface LiteAPIHotelsListWidgetProps {
  placeId: string;
  domain?: string;
  primaryColor?: string;
  currency?: string;
  hasSearchBar?: boolean;
  rows?: number;
  className?: string;
  instanceId?: string;
}

export function LiteAPIHotelsListWidget({
  placeId,
  domain = LITEAPI_DOMAIN,
  primaryColor = LITEAPI_BRAND_COLOR,
  currency = "CAD",
  hasSearchBar = false,
  rows = 10,
  className,
  instanceId = "default",
}: LiteAPIHotelsListWidgetProps) {
  const initialized = useRef(false);
  const containerId = `liteapi-hotels-${instanceId}`;

  const initWidget = () => {
    if (initialized.current || !window.LiteAPI || !domain) return;
    initialized.current = true;

    window.LiteAPI.init({ domain });
    window.LiteAPI.HotelsList.create({
      selector: `#${containerId}`,
      placeId,
      primaryColor,
      currency,
      hasSearchBar,
      rows,
    });
  };

  useEffect(() => {
    if (window.LiteAPI) initWidget();
  }, [placeId]);

  if (!domain) return null;

  return (
    <div className={className}>
      <Script
        src={LITEAPI_SDK_URL}
        strategy="afterInteractive"
        onLoad={initWidget}
      />
      <div id={containerId} style={{ width: "100%" }} />
    </div>
  );
}
