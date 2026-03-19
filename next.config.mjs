/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow any HTTPS image source — hotel images come from many CDNs (LiteAPI, Hotelbeds, WorldOTA, etc.)
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
