import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/supabase/queries";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const formData = await req.formData();
  const priceId = formData.get("priceId") as string;
  const cityId = formData.get("cityId") as string | null;

  if (!priceId) {
    return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
  }

  const dbUser = await getUserByClerkId(userId);
  if (!dbUser) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const session = await createCheckoutSession({
    priceId,
    userId: dbUser.id,
    cityId: cityId ?? undefined,
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/premium`,
  });

  return NextResponse.redirect(session.url!, 303);
}
