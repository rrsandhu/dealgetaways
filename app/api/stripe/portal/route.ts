import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/supabase/queries";
import { createCustomerPortalSession, getOrCreateStripeCustomer } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const dbUser = await getUserByClerkId(userId);
  if (!dbUser) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const customerId = await getOrCreateStripeCustomer(dbUser.email);
  const session = await createCustomerPortalSession(
    customerId,
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
  );

  return NextResponse.redirect(session.url, 303);
}
