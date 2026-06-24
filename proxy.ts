import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next.js 16 Proxy (formerly Middleware). Runs only on /admin/* (see matcher).
// Responsibilities:
//   1. Keep the Supabase session cookie fresh (calls getUser()).
//   2. Optimistic gate — bounce unauthenticated visitors to /admin/login.
// The AUTHORITATIVE check (is this user an allowlisted admin?) happens in the
// dashboard layout server component — proxy is intentionally lightweight.

// Admin pages must never be cached by a CDN: they are per-user (session) and
// App Router serves both HTML and an RSC flight payload at the same URL. A shared
// cache that ignores the `RSC` Vary header can otherwise serve the raw RSC payload
// as the document. `no-store` keeps every /admin/* response uncached.
function noStore<T extends NextResponse>(res: T): T {
  res.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
  return res;
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured yet, don't lock anyone out — just pass through.
  if (!url || !anonKey) return noStore(response);

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login";

  // Not signed in and trying to reach the dashboard → send to login.
  if (!user && !isLoginRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    return noStore(NextResponse.redirect(redirectUrl));
  }

  // Already signed in but sitting on the login page → send to the dashboard.
  if (user && isLoginRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin";
    return noStore(NextResponse.redirect(redirectUrl));
  }

  return noStore(response);
}

export const config = {
  matcher: ["/admin/:path*"],
};
