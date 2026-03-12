import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://canadahoteldeals.ca";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/alerts", "/saved-searches", "/account"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
