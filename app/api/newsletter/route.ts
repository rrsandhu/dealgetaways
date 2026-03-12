import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = formData.get("email") as string;

  if (!email || !email.includes("@")) {
    return NextResponse.redirect(new URL("/?newsletter=error", req.url), 303);
  }

  // Read UTM cookie
  const utmCookie = (await cookies()).get("_chd_utm")?.value;
  let utmSource = "direct";
  if (utmCookie) {
    try {
      const utm = JSON.parse(utmCookie);
      utmSource = utm.utm_source ?? "direct";
    } catch {}
  }

  try {
    // Add to newsletter list via Resend (or store in Supabase)
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "deals@dealgetaways.com",
      to: email,
      subject: "Welcome to DealGetaways newsletter 🍁",
      text: `Thanks for subscribing! You'll get the best Canadian hotel deals weekly.\n\nVisit: ${process.env.NEXT_PUBLIC_APP_URL}\n\n— DealGetaways`,
    });
  } catch (err) {
    console.error("Newsletter signup error:", err);
  }

  return NextResponse.redirect(new URL("/?newsletter=success", req.url), 303);
}
