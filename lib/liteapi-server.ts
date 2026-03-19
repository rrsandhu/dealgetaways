/**
 * Server-side LiteAPI helpers.
 * Never import from client components — API key is server-only.
 */

const LITEAPI_KEY = process.env.LITEAPI_API_KEY ?? "";
const BASE = "https://api.liteapi.travel/v3.0";
const BOOK = "https://book.liteapi.travel/v3.0";

function hdr(): HeadersInit {
  return {
    "X-API-Key": LITEAPI_KEY,
    accept: "application/json",
    "content-type": "application/json",
  };
}

// ── Places ────────────────────────────────────────────────────────────────────

export interface LiteAPIPlace {
  placeId: string;
  displayName: string;
  formattedAddress?: string;
}

export async function searchPlaces(textQuery: string): Promise<{ data: LiteAPIPlace[] }> {
  const res = await fetch(
    `${BASE}/data/places?textQuery=${encodeURIComponent(textQuery)}`,
    { headers: hdr(), cache: "no-store" }
  );
  return res.json();
}

// ── Rates ─────────────────────────────────────────────────────────────────────

export interface RatesParams {
  checkin: string;
  checkout: string;
  adults: number;
  currency?: string;
  guestNationality?: string;
  placeId?: string;
  hotelIds?: string[];
  aiSearch?: string;
  maxRatesPerHotel?: number;
}

export interface RoomRate {
  offerId: string;
  name: string;
  mappedRoomId?: number;
  boardName?: string;
  retailRate: {
    total: Array<{ amount: number; currency: string }>;
    taxesAndFees?: Array<{ included: boolean; amount?: number }>;
  };
  cancellationPolicies?: {
    refundableTag?: string; // "RFN" = refundable, "NRFN" = non-refundable
    cancelPolicyInfos?: Array<{ cancelTime: string }>;
  };
}

export interface HotelRateResult {
  hotelId: string;
  name?: string;
  main_photo?: string;
  address?: string;
  rating?: number;
  starRating?: number;
  tags?: string[];
  story?: string;
  persona?: string;
  roomTypes: Array<{ offerId: string; rates: RoomRate[] }>;
}

export async function searchRates(params: RatesParams): Promise<{
  results: HotelRateResult[];
  sandbox?: boolean;
}> {
  const body: Record<string, unknown> = {
    occupancies: [{ adults: params.adults }],
    currency: params.currency ?? "CAD",
    guestNationality: params.guestNationality ?? "CA",
    checkin: params.checkin,
    checkout: params.checkout,
    roomMapping: true,
    includeHotelData: true,
  };

  if (params.placeId) body.placeId = params.placeId;
  if (params.hotelIds?.length) body.hotelIds = params.hotelIds;
  if (params.aiSearch) body.aiSearch = params.aiSearch;
  if (params.maxRatesPerHotel !== undefined) body.maxRatesPerHotel = params.maxRatesPerHotel;

  const res = await fetch(`${BASE}/hotels/rates`, {
    method: "POST",
    headers: hdr(),
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = await res.json();

  // Normalise: merge hotels[] (AI search) + data[].hotelData (standard search)
  const hotelsMeta: Record<string, Record<string, unknown>> = {};
  for (const h of json.hotels ?? []) {
    hotelsMeta[h.id] = h;
  }

  const results: HotelRateResult[] = (json.data ?? []).map(
    (item: Record<string, unknown>) => {
      const meta = hotelsMeta[item.hotelId as string] ?? (item.hotelData as Record<string, unknown>) ?? {};
      const roomTypes = (item.roomTypes as Array<{ offerId: string; rates: RoomRate[] }>) ?? [];
      // Flatten rates from roomTypes so each entry has the offerId at the rate level
      const flatRoomTypes = roomTypes.map((rt) => ({
        offerId: rt.offerId,
        rates: (rt.rates ?? []).map((r) => ({ ...r, offerId: rt.offerId })),
      }));

      // LiteAPI returns camelCase for AI-search hotels[] but may use snake_case in hotelData
      const starRating =
        (meta.starRating as number) ??
        (meta.star_rating as number) ??
        undefined;
      const rating =
        (meta.rating as number) ??
        (meta.rating_average as number) ??
        (meta.review_score as number) ??
        undefined;

      return {
        hotelId: item.hotelId as string,
        name: (meta.name as string) ?? undefined,
        main_photo: (meta.main_photo as string) ?? undefined,
        address: (meta.address as string) ?? undefined,
        rating,
        starRating,
        tags: (meta.tags as string[]) ?? [],
        story: (meta.story as string) ?? undefined,
        persona: (meta.persona as string) ?? undefined,
        roomTypes: flatRoomTypes,
      };
    }
  );

  return { results, sandbox: json.sandbox };
}

// ── Hotel details ─────────────────────────────────────────────────────────────

export interface HotelRoom {
  id: number;
  roomName: string;
  photos: Array<{ url: string }>;
}

export interface HotelDetails {
  id: string;
  name: string;
  hotelDescription?: string;
  hotelImportantInformation?: string;
  hotelImages?: Array<{ url: string; defaultImage?: boolean }>;
  main_photo?: string;
  city?: string;
  country?: string;
  address?: string;
  hotelFacilities?: string[];
  starRating?: number;
  location?: { latitude: number; longitude: number };
  rooms?: HotelRoom[];
  policies?: Array<{ name: string; description: string }>;
  sentiment_analysis?: { pros: string[]; cons: string[] };
  rating?: number;
}

export async function getHotelDetails(hotelId: string): Promise<{ data: HotelDetails }> {
  const res = await fetch(
    `${BASE}/data/hotel?hotelId=${encodeURIComponent(hotelId)}&timeout=4`,
    { headers: hdr(), next: { revalidate: 3600 } }
  );
  return res.json();
}

// ── Prebook ───────────────────────────────────────────────────────────────────

export interface PrebookResult {
  prebookId: string;
  offerId: string;
  hotelId: string;
  price: number;
  currency: string;
  transactionId: string;
  secretKey: string;
  paymentTypes: string[];
  roomTypes: Array<{
    rates: Array<{
      rateId: string;
      retailRate: { total: Array<{ amount: number; currency: string }> };
      cancellationPolicies: {
        refundableTag?: string;
        cancelPolicyInfos?: Array<{ cancelTime: string }>;
      };
    }>;
  }>;
}

export async function prebookOffer(offerId: string): Promise<{
  data?: PrebookResult;
  error?: { code: number; message: string; description: string };
}> {
  const res = await fetch(`${BOOK}/rates/prebook`, {
    method: "POST",
    headers: hdr(),
    body: JSON.stringify({ offerId, usePaymentSdk: true }),
    cache: "no-store",
  });
  return res.json();
}

// ── Book ──────────────────────────────────────────────────────────────────────

export interface BookParams {
  prebookId: string;
  transactionId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface BookResult {
  bookingId: string;
  status: string;
  hotelConfirmationCode?: string;
  checkin?: string;
  checkout?: string;
  hotel?: { hotelId: string; name: string };
  price?: number;
  currency?: string;
  cancellationPolicies?: {
    refundableTag?: string;
    cancelPolicyInfos?: Array<{ cancelTime: string }>;
  };
}

export async function bookHotel(params: BookParams): Promise<{
  data?: BookResult;
  error?: { code: number; message: string; description: string };
}> {
  const body = {
    prebookId: params.prebookId,
    holder: {
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
    },
    payment: {
      method: "TRANSACTION_ID",
      transactionId: params.transactionId,
    },
    guests: [
      {
        occupancyNumber: 1,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
      },
    ],
  };

  const res = await fetch(`${BOOK}/rates/book`, {
    method: "POST",
    headers: hdr(),
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return res.json();
}
