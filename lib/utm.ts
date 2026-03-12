import type { UtmParams } from "@/types";

/**
 * Extract UTM parameters from a URL's search params.
 */
export function extractUtmParams(
  searchParams: URLSearchParams | Record<string, string>
): UtmParams {
  const get = (key: string): string | undefined => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key) ?? undefined;
    }
    return searchParams[key] ?? undefined;
  };

  return {
    utm_source: get("utm_source"),
    utm_medium: get("utm_medium"),
    utm_campaign: get("utm_campaign"),
    utm_content: get("utm_content"),
    utm_term: get("utm_term"),
  };
}

/**
 * Build a booking URL with affiliate tag and UTM passthrough.
 */
export function buildBookingUrl(
  baseUrl: string,
  utmParams?: UtmParams
): string {
  if (!baseUrl) return "#";
  try {
    const url = new URL(baseUrl);
    const affiliateTag = process.env.AFFILIATE_TAG ?? "canadahoteldeals-20";
    url.searchParams.set("affid", affiliateTag);
    url.searchParams.set("label", "canadahoteldeals");

    if (utmParams?.utm_source) {
      url.searchParams.set("utm_source", utmParams.utm_source);
    }
    if (utmParams?.utm_campaign) {
      url.searchParams.set("utm_campaign", utmParams.utm_campaign);
    }
    return url.toString();
  } catch {
    return baseUrl;
  }
}

/**
 * Serialize UTM params to a query string fragment.
 */
export function utmToQueryString(utm: UtmParams): string {
  const params = new URLSearchParams();
  Object.entries(utm).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  const str = params.toString();
  return str ? `?${str}` : "";
}

/**
 * Check if traffic is from TikTok.
 */
export function isTikTokTraffic(utm: UtmParams): boolean {
  return utm.utm_source?.toLowerCase() === "tiktok";
}
