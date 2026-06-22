import "server-only";

import { Resend } from "resend";

/**
 * Server-only Resend client. `import "server-only"` makes the build fail if this
 * is ever pulled into a Client Component, keeping RESEND_API_KEY off the browser.
 *
 * Use in route handlers / server actions only - e.g. emailing the trade desk
 * when an order is placed, and acknowledging the buyer.
 */
export function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY. Add it to .env.local (server-only).");
  }
  return new Resend(apiKey);
}

/** Verified sender, e.g. "House of Alex <orders@your-domain.com>". */
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "House of Alex <onboarding@resend.dev>";

/** Internal inbox that receives new wholesale orders / enquiries. */
export const ORDER_INBOX_EMAIL = process.env.ORDER_INBOX_EMAIL ?? "";
