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
  checkin?: string;
  checkout?: string;
  adults?: number;
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
  checkin,
  checkout,
  adults = 2,
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
      onHotelClick: (hotel: unknown) => {
        const h = hotel as { hotelId?: string; id?: string };
        const hotelId = h.hotelId ?? h.id;
        if (!hotelId) return;
        const params = new URLSearchParams({ adults: String(adults) });
        if (checkin) params.set("checkin", checkin);
        if (checkout) params.set("checkout", checkout);
        window.location.href = `/hotel/${hotelId}?${params.toString()}`;
      },
    });
  };

  useEffect(() => {
    if (window.LiteAPI) initWidget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
