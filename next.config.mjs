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
    ],
  },
};

export default nextConfig;
