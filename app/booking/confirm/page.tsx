import type { Metadata } from "next";
import { BookingConfirmClient } from "./booking-confirm-client";

export const metadata: Metadata = {
  title: "Booking Confirmed — Deal Getaways",
};

interface PageProps {
  searchParams: Promise<{
    prebookId?: string;
    transactionId?: string;
  }>;
}

export default async function BookingConfirmPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return <BookingConfirmClient prebookId={sp.prebookId} transactionId={sp.transactionId} />;
}
