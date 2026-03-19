"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, Loader2, AlertCircle, CreditCard, Calendar, Users } from "lucide-react";

interface Props {
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
}

type Step = "details" | "payment" | "processing";

export function CheckoutClient({
  offerId,
  checkin = "",
  checkout = "",
  adults = "2",
  hotelId,
  hotelName,
  roomName,
  price,
  currency = "CAD",
  nights: nightsStr,
}: Props) {
  const nights = nightsStr ? Number(nightsStr) : 1;
  const priceNum = price ? Number(price) : null;
  const totalPrice = priceNum != null ? priceNum * nights : null;

  const [step, setStep] = useState<Step>("details");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prebookError, setPrebookError] = useState<string | null>(null);
  const paymentContainerRef = useRef<HTMLDivElement>(null);
  const sdkInitialized = useRef(false);

  function fmtDate(d: string) {
    if (!d) return "";
    return new Date(d + "T12:00:00").toLocaleDateString("en-CA", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  function fmtPrice(amount: number) {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!lastName.trim()) e.lastName = "Last name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    return e;
  }

  async function handleContinueToPayment(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setPrebookError(null);
    setStep("processing");

    try {
      // 1. Prebook
      const prebookRes = await fetch("/api/liteapi/prebook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ offerId }),
      });
      const prebookJson = await prebookRes.json();
      if (!prebookRes.ok || !prebookJson?.data?.prebookId) {
        throw new Error(prebookJson?.error ?? "Prebook failed. Please try again.");
      }
      const { prebookId, transactionId, secretKey } = prebookJson.data as {
        prebookId: string;
        transactionId: string;
        secretKey: string;
      };

      // 2. Store guest details in sessionStorage (used by /booking/confirm)
      sessionStorage.setItem(
        "checkout_guest",
        JSON.stringify({ firstName, lastName, email })
      );
      sessionStorage.setItem(
        "checkout_booking",
        JSON.stringify({ hotelName, roomName, checkin, checkout, adults, price: priceNum, currency, nights })
      );

      // 3. Build returnUrl with prebookId + transactionId
      const returnUrl = `${window.location.origin}/booking/confirm?prebookId=${prebookId}&transactionId=${transactionId}`;

      // 4. Load and initialize LiteAPI Payment SDK
      await loadPaymentSdk();
      setStep("payment");

      // Wait for DOM to update, then init SDK
      setTimeout(() => {
        if (!sdkInitialized.current && window.LiteAPIPayment) {
          sdkInitialized.current = true;
          const payment = new window.LiteAPIPayment({
            publicKey: "sandbox",
            secretKey,
            returnUrl,
            targetElement: "#liteapi-payment-container",
            appearance: { theme: "stripe" },
            options: { business: { name: "Deal Getaways" } },
          });
          payment.handlePayment();
        }
      }, 100);
    } catch (err) {
      setPrebookError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStep("details");
    }
  }

  function loadPaymentSdk(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.LiteAPIPayment) { resolve(); return; }
      const script = document.createElement("script");
      script.src = "https://payment-wrapper.liteapi.travel/dist/liteAPIPayment.js?v=a1";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Payment SDK failed to load"));
      document.head.appendChild(script);
    });
  }

  if (!offerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
          <p className="text-gray-700 font-medium">No offer selected.</p>
          <Link href="/hotels" className="inline-block rounded-xl bg-[#E76D38] px-5 py-2.5 text-sm font-bold text-white">
            Search Hotels
          </Link>
        </div>
      </div>
    );
  }

  // ── Shared order summary sidebar ──────────────────────────────────────────
  const OrderSummary = () => (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
      <h2 className="font-bold text-gray-900">Order Summary</h2>

      <div className="space-y-3 text-sm">
        <div>
          <p className="font-semibold text-gray-900 line-clamp-2">{hotelName ?? "Hotel"}</p>
          {roomName && <p className="text-gray-500 mt-0.5">{roomName}</p>}
        </div>

        <div className="border-t border-gray-100 pt-3 space-y-2">
          <div className="flex items-start gap-2 text-gray-600">
            <Calendar className="h-4 w-4 shrink-0 mt-0.5 text-[#2F7C9C]" />
            <div>
              <p>{fmtDate(checkin)}</p>
              <p className="text-gray-400">→ {fmtDate(checkout)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4 shrink-0 text-[#2F7C9C]" />
            <p>{adults} {Number(adults) === 1 ? "adult" : "adults"} · {nights} {nights === 1 ? "night" : "nights"}</p>
          </div>
        </div>

        {priceNum != null && (
          <div className="border-t border-gray-100 pt-3 space-y-1.5">
            <div className="flex justify-between text-gray-600">
              <span>{fmtPrice(priceNum)} × {nights} {nights === 1 ? "night" : "nights"}</span>
              <span>{totalPrice != null ? fmtPrice(totalPrice) : "—"}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
              <span>Total</span>
              <span>{totalPrice != null ? fmtPrice(totalPrice) : "—"}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs text-green-700">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <span>Secure checkout — powered by LiteAPI</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-4 py-3 sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-4xl flex items-center gap-3">
          <Link
            href={hotelId ? `/hotel/${hotelId}?checkin=${checkin}&checkout=${checkout}&adults=${adults}` : "/hotels"}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#2F7C9C]" />
            <span className="font-semibold text-gray-900">Checkout</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: form / payment */}
          <div className="lg:col-span-2 space-y-5">

            {/* ── Step: Guest Details ── */}
            {(step === "details" || step === "processing") && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Guest Details</h2>
                <p className="text-sm text-gray-500 mb-5">Your booking confirmation will be sent to the email below.</p>

                {prebookError && (
                  <div className="mb-4 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{prebookError}</p>
                  </div>
                )}

                <form onSubmit={handleContinueToPayment} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        First name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        autoComplete="given-name"
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#2F7C9C] focus:ring-2 focus:ring-[#2F7C9C]/20 ${
                          errors.firstName ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
                        }`}
                      />
                      {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Last name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        autoComplete="family-name"
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#2F7C9C] focus:ring-2 focus:ring-[#2F7C9C]/20 ${
                          errors.lastName ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
                        }`}
                      />
                      {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      autoComplete="email"
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#2F7C9C] focus:ring-2 focus:ring-[#2F7C9C]/20 ${
                        errors.email ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
                      }`}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={step === "processing"}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#E76D38] px-6 py-3 text-sm font-bold text-white hover:bg-[#c45a2a] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                  >
                    {step === "processing" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Securing your room…
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Continue to Payment
                      </>
                    )}
                  </button>

                  {step === "processing" && (
                    <p className="text-center text-xs text-gray-400">
                      Confirming availability — this may take a few seconds
                    </p>
                  )}
                </form>
              </div>
            )}

            {/* ── Step: Payment SDK ── */}
            {step === "payment" && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Payment</h2>
                <p className="text-sm text-gray-500 mb-5">Complete your payment securely below.</p>

                {/* LiteAPI Payment SDK target */}
                <div id="liteapi-payment-container" ref={paymentContainerRef} className="min-h-[300px]" />

                <p className="mt-4 text-center text-xs text-gray-400">
                  🧪 Sandbox mode — use test card <strong>4242 4242 4242 4242</strong>, any future expiry, any CVC
                </p>
              </div>
            )}
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>

      {/* Global style to match payment SDK button to our orange */}
      <style jsx global>{`
        .lp-submit-button,
        button[data-testid="submit"],
        #liteapi-payment-container button[type="submit"] {
          background-color: #E76D38 !important;
          border-color: #E76D38 !important;
          border-radius: 0.75rem !important;
          font-weight: 700 !important;
        }
        .lp-submit-button:hover {
          background-color: #c45a2a !important;
        }
      `}</style>
    </div>
  );
}
