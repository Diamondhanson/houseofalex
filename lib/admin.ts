// Authoritative admin allowlist. Only these emails may receive an OTP and pass
// the dashboard gate. Configured via the ADMIN_EMAILS env var (comma-separated).
//
// This is a server-readable env (NOT NEXT_PUBLIC_) so the list never ships to
// the browser.

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}
