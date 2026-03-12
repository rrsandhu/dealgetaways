import { NextRequest, NextResponse } from "next/server";
import { searchDeals, getFlashDeals, getLastMinuteDeals } from "@/lib/supabase/queries";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type");

  try {
    if (type === "flash") {
      const deals = await getFlashDeals(20);
      return NextResponse.json({ deals });
    }

    if (type === "last-minute") {
      const deals = await getLastMinuteDeals(20);
      return NextResponse.json({ deals });
    }

    const { deals, total } = await searchDeals({
      destination: searchParams.get("destination") ?? undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      minStars: searchParams.get("minStars")
        ? Number(searchParams.get("minStars"))
        : undefined,
      sortBy:
        (searchParams.get("sortBy") as "best_deals" | "price_asc" | "top_rated") ??
        "best_deals",
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 20),
    });

    return NextResponse.json({ deals, total });
  } catch (err: any) {
    console.error("Deals API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}
