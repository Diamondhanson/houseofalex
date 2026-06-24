// Force the login route to render dynamically and never be statically cached.
// Without this it is prerendered and Hostinger's CDN caches it for a year with
// only `Vary: Accept-Encoding` — which lets the cache serve the RSC flight
// payload in place of the HTML document (raw ":HL[...]" text in the browser).
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
