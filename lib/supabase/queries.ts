import { createAnonServerClient, createServerClient } from "./server";
import type {
  DbCity,
  DbDeal,
  DbHotel,
  DbSubscription,
  HotelWithDeals,
} from "@/types";

// ─── Cities ───────────────────────────────────────────────────────────────────

export async function getAllCities(): Promise<DbCity[]> {
  const supabase = createAnonServerClient();
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getCityBySlug(slug: string): Promise<DbCity | null> {
  const supabase = createAnonServerClient();
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

// ─── Hotels ───────────────────────────────────────────────────────────────────

export async function getHotelsByCity(cityId: string): Promise<DbHotel[]> {
  const supabase = createAnonServerClient();
  const { data, error } = await supabase
    .from("hotels")
    .select("*")
    .eq("city_id", cityId);
  if (error) throw error;
  return data ?? [];
}

export async function getHotelById(
  id: string
): Promise<(DbHotel & { city?: DbCity }) | null> {
  const supabase = createAnonServerClient();
  const { data, error } = await supabase
    .from("hotels")
    .select("*, city:cities(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

// ─── Deals ────────────────────────────────────────────────────────────────────

export async function getActiveDeals(limit = 20): Promise<DbDeal[]> {
  const supabase = createAnonServerClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("is_active", true)
    .order("savings_percent", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getFlashDeals(limit = 12): Promise<
  (DbDeal & { hotel: DbHotel & { city: DbCity } })[]
> {
  const supabase = createAnonServerClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*, hotel:hotels(*, city:cities(*))")
    .eq("is_active", true)
    .not("expires_at", "is", null)
    .order("expires_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as (DbDeal & { hotel: DbHotel & { city: DbCity } })[];
}

export async function getLastMinuteDeals(limit = 12): Promise<
  (DbDeal & { hotel: DbHotel & { city: DbCity } })[]
> {
  const supabase = createAnonServerClient();
  const now = new Date();
  const cutoff = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("deals")
    .select("*, hotel:hotels(*, city:cities(*))")
    .eq("is_active", true)
    .lte("check_in_date", cutoff)
    .order("savings_percent", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as (DbDeal & { hotel: DbHotel & { city: DbCity } })[];
}

export async function getDealsByCity(
  cityId: string,
  limit = 50
): Promise<(DbDeal & { hotel: DbHotel })[]> {
  const supabase = createAnonServerClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*, hotel:hotels!inner(*)")
    .eq("hotels.city_id", cityId)
    .eq("is_active", true)
    .order("savings_percent", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as (DbDeal & { hotel: DbHotel })[];
}

export async function getDealsByHotel(hotelId: string): Promise<DbDeal[]> {
  const supabase = createAnonServerClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("hotel_id", hotelId)
    .eq("is_active", true)
    .order("savings_percent", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getTopDeals(limit = 20): Promise<
  (DbDeal & { hotel: DbHotel & { city: DbCity } })[]
> {
  const supabase = createAnonServerClient();
  const { data, error } = await supabase
    .from("deals")
    .select("*, hotel:hotels(*, city:cities(*))")
    .eq("is_active", true)
    .order("savings_percent", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as (DbDeal & { hotel: DbHotel & { city: DbCity } })[];
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchDeals(params: {
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  minStars?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}): Promise<{
  deals: (DbDeal & { hotel: DbHotel & { city: DbCity } })[];
  total: number;
}> {
  const supabase = createAnonServerClient();
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("deals")
    .select("*, hotel:hotels(*, city:cities(*))", { count: "exact" })
    .eq("is_active", true);

  if (params.destination) {
    // Filter by city name or slug via the joined hotels→cities
    query = query.ilike("hotels.cities.name", `%${params.destination}%`);
  }
  if (params.minPrice) query = query.gte("deal_price", params.minPrice);
  if (params.maxPrice) query = query.lte("deal_price", params.maxPrice);
  if (params.minStars)
    query = query.gte("hotels.star_rating", params.minStars);

  if (params.sortBy === "price_asc") {
    query = query.order("deal_price", { ascending: true });
  } else if (params.sortBy === "top_rated") {
    query = query.order("hotels.star_rating", { ascending: false });
  } else {
    query = query.order("savings_percent", { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    deals: (data ?? []) as (DbDeal & { hotel: DbHotel & { city: DbCity } })[],
    total: count ?? 0,
  };
}

// ─── User & subscriptions ────────────────────────────────────────────────────

export async function getUserByClerkId(
  clerkId: string
): Promise<{ id: string; email: string; clerk_id: string } | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();
  if (error) return null;
  return data;
}

export async function createUser(params: {
  email: string;
  clerk_id: string;
}): Promise<void> {
  const supabase = createServerClient();
  await supabase.from("users").insert(params);
}

export async function getUserSubscriptions(
  userId: string
): Promise<DbSubscription[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active");
  if (error) return [];
  return data ?? [];
}

export async function getSubscribedCityIds(
  userId: string
): Promise<string[]> {
  const subs = await getUserSubscriptions(userId);
  return subs.map((s) => s.city_id).filter(Boolean) as string[];
}

export async function upsertSubscription(params: {
  user_id: string;
  city_id?: string | null;
  stripe_subscription_id: string;
  status: string;
}): Promise<void> {
  const supabase = createServerClient();
  await supabase.from("subscriptions").upsert(
    {
      ...params,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" }
  );
}

export async function updateSubscriptionStatus(
  stripeSubscriptionId: string,
  status: string
): Promise<void> {
  const supabase = createServerClient();
  await supabase
    .from("subscriptions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", stripeSubscriptionId);
}

// ─── Price history ────────────────────────────────────────────────────────────

export async function getPriceHistory(hotelId: string) {
  const supabase = createAnonServerClient();
  const { data, error } = await supabase
    .from("price_history")
    .select("*")
    .eq("hotel_id", hotelId)
    .order("recorded_at", { ascending: true })
    .limit(30);
  if (error) return [];
  return data ?? [];
}

// ─── City deal counts ─────────────────────────────────────────────────────────

export async function getCityDealCounts(): Promise<
  Record<string, number>
> {
  const supabase = createAnonServerClient();
  // Get all active deals with their hotel's city_id
  const { data, error } = await supabase
    .from("deals")
    .select("hotel:hotels(city_id)")
    .eq("is_active", true);

  if (error) return {};

  const counts: Record<string, number> = {};
  (data ?? []).forEach((row: any) => {
    const cityId = row.hotel?.city_id;
    if (cityId) counts[cityId] = (counts[cityId] ?? 0) + 1;
  });
  return counts;
}
