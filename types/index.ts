// ─── Supabase DB types ───────────────────────────────────────────────────────

export interface DbCity {
  id: string;
  name: string;
  country: string;
  slug: string;
}

export interface DbHotel {
  id: string;
  name: string;
  city_id: string;
  star_rating: number;
  image_url: string | null;
  description: string | null;
}

export interface DbDeal {
  id: string;
  hotel_id: string;
  original_price: number;
  deal_price: number;
  savings_percent: number;
  check_in_date: string | null;
  check_out_date: string | null;
  booking_url: string | null;
  source: string | null;
  is_active: boolean;
  expires_at: string | null;
}

export interface DbPriceHistory {
  id: string;
  hotel_id: string;
  price: number;
  recorded_at: string;
}

export interface DbUser {
  id: string;
  email: string;
  clerk_id: string;
}

export interface DbSubscription {
  id: string;
  user_id: string;
  city_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
}

// ─── App-level types ─────────────────────────────────────────────────────────

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "incomplete";

export type SubscriptionPlan = "free" | "premium_monthly" | "premium_annual";

export interface City extends DbCity {
  deal_count?: number;
  hotel_count?: number;
}

export interface Hotel extends DbHotel {
  city?: DbCity;
}

export interface Deal extends DbDeal {
  hotel?: Hotel & { city?: DbCity };
}

export interface HotelWithDeals extends DbHotel {
  city?: DbCity;
  deals: DbDeal[];
  best_deal?: DbDeal;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchParams {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  minStars?: number;
  sortBy?: "best_deals" | "price_asc" | "top_rated";
  page?: number;
  limit?: number;
}

// ─── UTM tracking ─────────────────────────────────────────────────────────────

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

export interface PricingPlan {
  id: SubscriptionPlan;
  name: string;
  price: number;
  period: string;
  pricePerMonth?: number;
  description: string;
  features: string[];
  highlighted: boolean;
  stripePriceId: string;
  badge?: string;
}
