import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only privileged Supabase client.
 *
 * Uses the SERVICE-ROLE (secret) key, which **bypasses Row Level Security**.
 * The `import "server-only"` above makes the build FAIL if this file is ever
 * imported into a Client Component - that is the guardrail that keeps the
 * secret key off the browser.
 *
 * Use ONLY in: route handlers (`app/api/**`), server actions, and server
 * components - for trusted operations (inserting validated orders, admin CRUD,
 * reading all orders). Always validate + recompute prices server-side first;
 * never trust amounts sent by the client.
 */
export function getServiceSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local (server-only).",
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
