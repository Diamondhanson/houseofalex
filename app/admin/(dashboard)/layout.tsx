import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Boxes, LayoutDashboard, LifeBuoy, Settings } from "lucide-react";
import { getServerAuthClient } from "@/lib/supabase/server-auth";
import { isAllowedAdmin } from "@/lib/admin";
import { SignOutButton } from "@/components/admin/SignOutButton";

export const metadata: Metadata = {
  title: "Admin",
  description: "House of Alex management console.",
};

// The auth gate reads cookies and must run on every request - never prerender.
export const dynamic = "force-dynamic";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Boxes, label: "Catalogue" },
  { icon: Settings, label: "Settings" },
  { icon: LifeBuoy, label: "Support" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative gate - must be a signed-in, allowlisted admin.
  // If Supabase isn't configured yet, this throws → treated as "not signed in".
  let user: { email?: string } | null = null;
  try {
    const supabase = await getServerAuthClient();
    user = (await supabase.auth.getUser()).data.user;
  } catch {
    user = null;
  }

  if (!user || !isAllowedAdmin(user.email)) {
    redirect("/admin/login");
  }

  const email = user.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5">
          <span className="flex h-9 w-9 items-center justify-center bg-red-600 text-white">
            <Boxes className="h-5 w-5" />
          </span>
          <div className="leading-none">
            <div className="text-sm font-bold text-slate-900">House of Alex</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-600">
              Admin Console
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {NAV.map(({ icon: Icon, label, active }) => (
            <span
              key={label}
              className={`flex cursor-default items-center gap-3 px-3 py-2.5 text-sm font-medium ${
                active ? "bg-red-50 text-red-700" : "text-slate-500"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </span>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to storefront
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center bg-red-600 text-white lg:hidden"
            >
              <Boxes className="h-5 w-5" />
            </Link>
            <h1 className="text-sm font-semibold text-slate-900">Management Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[14rem] truncate text-right text-xs leading-tight text-slate-500 sm:block">
              <span className="block font-medium text-slate-900">Signed in</span>
              {email}
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
              {initials}
            </span>
            <SignOutButton />
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
