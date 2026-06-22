"use client";

import { LogOut } from "lucide-react";
import { adminSignOut } from "@/app/admin/login/actions";

export function SignOutButton() {
  return (
    <form action={adminSignOut}>
      <button
        type="submit"
        className="flex items-center gap-2 border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-red-400 hover:text-red-600"
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign out
      </button>
    </form>
  );
}
