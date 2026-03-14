import { NextRequest, NextResponse } from "next/server";
import { prebookOffer } from "@/lib/liteapi-server";

/**
 * POST /api/liteapi/prebook
 * Body: { offerId }
 * Returns prebookId, transactionId, secretKey for payment SDK.
 * Can take 5-10 seconds.
 */
export async function POST(req: NextRequest) {
  try {
    const { offerId } = await req.json();
    if (!offerId) {
      return NextResponse.json({ error: "offerId is required" }, { status: 400 });
    }

    const result = await prebookOffer(offerId);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[liteapi/prebook]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
