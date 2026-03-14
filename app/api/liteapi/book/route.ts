import { NextRequest, NextResponse } from "next/server";
import { bookHotel } from "@/lib/liteapi-server";

/**
 * POST /api/liteapi/book
 * Body: { prebookId, transactionId, firstName, lastName, email }
 * Can take 5-10 seconds.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prebookId, transactionId, firstName, lastName, email } = body;

    if (!prebookId || !transactionId || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "prebookId, transactionId, firstName, lastName, and email are required" },
        { status: 400 }
      );
    }

    const result = await bookHotel({ prebookId, transactionId, firstName, lastName, email });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[liteapi/book]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
