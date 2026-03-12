import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getAllCities } from "@/lib/supabase/queries";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "DealGetaways — Canada's Best Hotel Deals",
    template: "%s | DealGetaways",
  },
  description:
    "Discover incredible hotel deals across 24 Canadian cities. 929+ real deals updated daily. Flash deals, last minute offers, and exclusive rates on top hotels in Toronto, Vancouver, Montréal, Banff, Whistler and more.",
  keywords: [
    "Canada hotel deals",
    "cheap hotels Canada",
    "Toronto hotel deals",
    "Vancouver hotel discounts",
    "Banff hotel deals",
    "Whistler hotel deals",
    "flash hotel deals Canada",
    "last minute hotels Canada",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://dealgetaways.com"
  ),
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: "DealGetaways",
    title: "DealGetaways — Canada's Best Hotel Deals",
    description: "929+ real hotel deals across 24 Canadian cities. Updated daily.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DealGetaways",
    description: "929+ real hotel deals across 24 Canadian cities.",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let cities: Awaited<ReturnType<typeof getAllCities>> = [];
  try {
    cities = await getAllCities();
  } catch {
    // Supabase not configured yet
  }

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} min-h-screen bg-gray-50`}>
          <Navbar cities={cities} />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <Footer cities={cities} />
        </body>
      </html>
    </ClerkProvider>
  );
}
