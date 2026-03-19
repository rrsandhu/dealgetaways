/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.supabase.in" },
      // Booking.com image CDN
      { protocol: "https", hostname: "cf.bstatic.com" },
      { protocol: "https", hostname: "cf2.bstatic.com" },
      { protocol: "https", hostname: "**.bstatic.com" },
      { protocol: "https", hostname: "q-xx.bstatic.com" },
      // LiteAPI / hotel image CDNs
      { protocol: "https", hostname: "**.liteapi.travel" },
      { protocol: "https", hostname: "photos.hotelbeds.com" },
      { protocol: "https", hostname: "**.hotelbeds.com" },
      { protocol: "https", hostname: "**.expediagroup.com" },
      { protocol: "https", hostname: "images.trvl-media.com" },
      { protocol: "https", hostname: "**.trvl-media.com" },
      { protocol: "https", hostname: "**.iceportal.com" },
      { protocol: "https", hostname: "**.giata.com" },
      { protocol: "https", hostname: "**.availpro.com" },
      { protocol: "https", hostname: "**.channelmanager.com" },
      { protocol: "https", hostname: "s3.amazonaws.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.cloudfront.net" },
    ],
  },
};

export default nextConfig;
