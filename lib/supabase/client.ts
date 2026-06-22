"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client (cookie-based session via @supabase/ssr).
 *
 * Uses the PUBLIC anon/publishable key - safe to ship; all table access is
 * constrained by Row Level Security. Cookie storage lets the proxy and server
 * components read the same session. Never put the service-role key here.
 */
let browserClient: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local.",
    );
  }

  browserClient = createBrowserClient(url, anonKey);
  return browserClient;
}
