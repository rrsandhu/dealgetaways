"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { LITEAPI_DOMAIN, LITEAPI_BRAND_COLOR, LITEAPI_SDK_URL } from "@/lib/liteapi";

interface LiteAPIMapWidgetProps {
  placeId: string;
  domain?: string;
  primaryColor?: string;
  currency?: string;
  /** Height of the map container */
  height?: string;
  className?: string;
  /** Unique suffix to avoid ID collisions if multiple maps on page */
  instanceId?: string;
}

export function LiteAPIMapWidget({
  placeId,
  domain = LITEAPI_DOMAIN,
  primaryColor = LITEAPI_BRAND_COLOR,
  currency = "CAD",
  height = "500px",
  className,
  instanceId = "default",
}: LiteAPIMapWidgetProps) {
  const initialized = useRef(false);
  const containerId = `liteapi-map-${instanceId}`;

  const initWidget = () => {
    if (initialized.current || !window.LiteAPI || !domain) return;
    initialized.current = true;

    window.LiteAPI.init({ domain });
    window.LiteAPI.Map.create({
      selector: `#${containerId}`,
      placeId,
      primaryColor,
      currency,
      hideLogo: false,
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
      <div id={containerId} style={{ width: "100%", height }} />
    </div>
  );
}
