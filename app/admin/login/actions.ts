"use server";

import { redirect } from "next/navigation";
import { getServerAuthClient } from "@/lib/supabase/server-auth";
import { isAllowedAdmin } from "@/lib/admin";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Step 1 - email a one-time code. We only actually send it to allowlisted admin
 * emails, but always return a generic success so the form never reveals which
 * emails are valid (prevents enumeration).
 */
export async function sendAdminOtp(email: string): Promise<ActionResult> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { ok: false, error: "Enter your email address." };

  // Silently no-op for non-admins - don't disclose the allowlist.
  if (!isAllowedAdmin(normalized)) return { ok: true };

  const supabase = await getServerAuthClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: { shouldCreateUser: true },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Step 2 - verify the 6-digit code. Re-checks the allowlist (defence in depth)
 * and, on success, the Supabase session cookie is set via the cookie adapter.
 */
export async function verifyAdminOtp(
  email: string,
  token: string,
): Promise<ActionResult> {
  const normalized = email.trim().toLowerCase();
  const code = token.replace(/\s/g, "");
  if (!isAllowedAdmin(normalized)) return { ok: false, error: "Not authorized." };
  if (!code) return { ok: false, error: "Enter the code from your email." };

  const supabase = await getServerAuthClient();
  const { error } = await supabase.auth.verifyOtp({
    email: normalized,
    token: code,
    type: "email",
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Sign the admin out and return to the login screen. */
export async function adminSignOut(): Promise<void> {
  const supabase = await getServerAuthClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
