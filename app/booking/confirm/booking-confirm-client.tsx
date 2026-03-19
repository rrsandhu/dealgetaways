"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  Users,
  Hotel,
  Mail,
  Copy,
  Check,
} from "lucide-react";

interface Props {
  prebookId?: string;
  transactionId?: string;
}

interface GuestData {
  firstName: string;
  lastName: string;
  email: string;
}

interface BookingData {
  hotelName?: string;
  roomName?: string;
  checkin?: string;
  checkout?: string;
  adults?: string;
  price?: number;
  currency?: string;
  nights?: number;
}

interface BookResult {
  bookingId?: string;
  hotelConfirmationCode?: string;
  status?: string;
}

export function BookingConfirmClient({ prebookId, transactionId }: Props) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [bookResult, setBookResult] = useState<BookResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [copied, setCopied] = useState(false);
  const booked = useRef(false);

  function fmtDate(d?: string) {
    if (!d) return "";
    return new Date(d + "T12:00:00").toLocaleDateString("en-CA", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function fmtPrice(amount: number, currency = "CAD") {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    if (booked.current) return;
    booked.current = true;

    // Read guest and booking data from sessionStorage
    try {
      const guestRaw = sessionStorage.getItem("checkout_guest");
      const bookingRaw = sessionStorage.getItem("checkout_booking");
      if (guestRaw) setGuest(JSON.parse(guestRaw));
      if (bookingRaw) setBooking(JSON.parse(bookingRaw));
    } catch {
      // ignore parse errors
    }

    if (!prebookId || !transactionId) {
      setErrorMsg("Missing booking reference. Please start a new search.");
      setStatus("error");
      return;
    }

    // Read guest from sessionStorage for the book call
    let guestData: GuestData = { firstName: "Guest", lastName: "User", email: "guest@dealgetaways.com" };
    try {
      const raw = sessionStorage.getItem("checkout_guest");
      if (raw) guestData = JSON.parse(raw);
    } catch {
      // ignore
    }

    fetch("/api/liteapi/book", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        prebookId,
        transactionId,
        firstName: guestData.firstName,
        lastName: guestData.lastName,
        email: guestData.email,
      }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Booking failed");
        const data = json?.data ?? json;
        setBookResult({
          bookingId: data.bookingId ?? data.booking_id,
          hotelConfirmationCode: data.hotelConfirmationCode ?? data.hotel_confirmation_code,
          status: data.status,
        });
        setStatus("success");
        // Clear sessionStorage
        sessionStorage.removeItem("checkout_guest");
        sessionStorage.removeItem("checkout_booking");
      })
      .catch((err) => {
        setErrorMsg(err.message ?? "An error occurred while completing your booking.");
        setStatus("error");
      });
  }, [prebookId, transactionId]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-5 px-4">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#2F7C9C]/10">
          <Loader2 className="h-8 w-8 text-[#2F7C9C] animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-lg font-semibold text-gray-900">Completing your booking…</p>
          <p className="text-sm text-gray-500">Please don&apos;t close this page</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-5 px-4">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <div className="text-center space-y-2 max-w-md">
          <p className="text-xl font-bold text-gray-900">Booking Failed</p>
          <p className="text-sm text-gray-600">{errorMsg}</p>
        </div>
        <Link
          href="/hotels"
          className="rounded-xl bg-[#E76D38] px-6 py-3 text-sm font-bold text-white hover:bg-[#c45a2a] transition-colors shadow-sm"
        >
          Search Again
        </Link>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  const totalPrice =
    booking?.price != null && booking.nights != null
      ? booking.price * booking.nights
      : null;

  const confirmationCode = bookResult?.hotelConfirmationCode ?? bookResult?.bookingId ?? prebookId ?? "";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Success banner */}
        <div className="rounded-2xl bg-green-50 border border-green-200 p-6 text-center space-y-3">
          <div className="flex items-center justify-center h-14 w-14 rounded-full bg-green-100 mx-auto">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">You&apos;re booked!</h1>
            <p className="text-sm text-gray-600 mt-1">
              A confirmation has been sent to {guest?.email ?? "your email"}.
            </p>
          </div>
        </div>

        {/* Confirmation code */}
        {confirmationCode && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Confirmation Code
            </p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xl font-black text-gray-900 tracking-wider">{confirmationCode}</span>
              <button
                onClick={() => copyToClipboard(confirmationCode)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            {bookResult?.status && (
              <p className="mt-1 text-xs text-gray-400">Status: {bookResult.status}</p>
            )}
          </div>
        )}

        {/* Booking details */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">Booking Details</h2>
          <div className="space-y-3 text-sm">
            {booking?.hotelName && (
              <div className="flex items-start gap-3">
                <Hotel className="h-4 w-4 text-[#2F7C9C] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">{booking.hotelName}</p>
                  {booking.roomName && <p className="text-gray-500">{booking.roomName}</p>}
                </div>
              </div>
            )}
            {booking?.checkin && booking.checkout && (
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-[#2F7C9C] shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-700">{fmtDate(booking.checkin)}</p>
                  <p className="text-gray-500">→ {fmtDate(booking.checkout)}</p>
                  {booking.nights && (
                    <p className="text-gray-400 text-xs mt-0.5">{booking.nights} {booking.nights === 1 ? "night" : "nights"}</p>
                  )}
                </div>
              </div>
            )}
            {booking?.adults && (
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-[#2F7C9C] shrink-0" />
                <p className="text-gray-700">{booking.adults} {Number(booking.adults) === 1 ? "adult" : "adults"}</p>
              </div>
            )}
            {guest?.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-[#2F7C9C] shrink-0" />
                <p className="text-gray-700">{guest.firstName} {guest.lastName} — {guest.email}</p>
              </div>
            )}
          </div>

          {totalPrice != null && booking?.currency && (
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
              <span className="text-sm text-gray-500">Total paid</span>
              <span className="text-lg font-black text-gray-900">
                {fmtPrice(totalPrice, booking.currency)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-center shadow-sm"
          >
            Back to Home
          </Link>
          <Link
            href="/hotels"
            className="flex-1 rounded-xl bg-[#E76D38] px-5 py-3 text-sm font-bold text-white hover:bg-[#c45a2a] transition-colors text-center shadow-sm"
          >
            Find More Deals
          </Link>
        </div>
      </div>
    </div>
  );
}
