import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { createUser } from "@/lib/supabase/queries";
import { sendWelcomeEmail } from "@/lib/resend";

interface ClerkUserCreatedEvent {
  type: "user.created";
  data: {
    id: string;
    email_addresses: Array<{ email_address: string; id: string }>;
    first_name: string | null;
    last_name: string | null;
  };
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const body = await req.text();
  const wh = new Webhook(webhookSecret);

  let event: ClerkUserCreatedEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserCreatedEvent;
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "user.created") {
    const { id: clerkId, email_addresses, first_name } = event.data;
    const email = email_addresses[0]?.email_address;

    if (email) {
      // Create user in Supabase
      await createUser({ email, clerk_id: clerkId }).catch(console.error);

      // Send welcome email
      await sendWelcomeEmail({
        to: email,
        userName: first_name ?? "there",
      }).catch(console.error);
    }
  }

  return NextResponse.json({ received: true });
}
