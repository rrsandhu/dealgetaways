import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");

export async function sendDealAlertEmail({
  to,
  userName,
  cityName,
  deals,
}: {
  to: string;
  userName: string;
  cityName: string;
  deals: Array<{
    hotelName: string;
    dealPrice: number;
    originalPrice: number;
    savingsPercent: number;
    bookingUrl: string;
  }>;
}) {
  // Placeholder — wire up a proper React Email template later
  const dealLines = deals
    .map(
      (d) =>
        `• ${d.hotelName}: $${d.dealPrice}/night (${d.savingsPercent}% off) — ${d.bookingUrl}`
    )
    .join("\n");

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "deals@canadahoteldeals.ca",
    to,
    subject: `🔔 New ${cityName} deals matching your alert`,
    text: `Hi ${userName},\n\nHere are new deals in ${cityName}:\n\n${dealLines}\n\n— Canada Hotel Deals`,
  });
}

export async function sendWelcomeEmail({
  to,
  userName,
}: {
  to: string;
  userName: string;
}) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "deals@canadahoteldeals.ca",
    to,
    subject: "Welcome to Canada Hotel Deals 🍁",
    text: `Hi ${userName},\n\nWelcome to Canada Hotel Deals! Start browsing the best hotel deals across Canada.\n\nVisit: ${process.env.NEXT_PUBLIC_APP_URL}\n\n— Canada Hotel Deals`,
  });
}

/**
 * Placeholder for the future notification engine.
 * This will be called by a cron job to check alerts and send emails.
 */
export async function triggerAlertNotifications(_alertId: string): Promise<void> {
  // TODO: Implement notification engine
  // 1. Fetch alert parameters from database
  // 2. Query deals matching those parameters
  // 3. Compare against last triggered timestamp
  // 4. Send email if new matching deals found
  // 5. Update last_triggered_at
  console.log("Alert notification trigger placeholder — implement with cron job");
}
