import type { Metadata } from "next";
import { CheckoutClient } from "./checkout-client";

export const metadata: Metadata = {
  title: "Checkout — Deal Getaways",
};

interface PageProps {
  searchParams: Promise<{
    offerId?: string;
    checkin?: string;
    checkout?: string;
    adults?: string;
    hotelId?: string;
    hotelName?: string;
    roomName?: string;
    price?: string;
    currency?: string;
    nights?: string;
  }>;
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return <CheckoutClient {...sp} />;
}
