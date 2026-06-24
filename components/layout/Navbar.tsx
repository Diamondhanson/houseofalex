"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, ShoppingCart, X } from "lucide-react";
import { usePallet } from "@/lib/context/PalletContext";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { totalPallets } = usePallet();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="House of Alex" className="h-9 w-9 object-contain" />
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight text-slate-900">
              House of Alex
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-600">
              Wholesale & Clearance Supply
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-red-600"
                    : "text-slate-600 hover:text-slate-900",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: cart + mobile toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/checkout"
            className="relative flex items-center gap-2 border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 transition-colors hover:border-slate-400"
            title="Your cart"
          >
            <ShoppingCart className="h-4 w-4 text-red-600" />
            <span className="hidden sm:inline">Cart</span>
            {totalPallets > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center bg-red-600 px-1 text-[11px] font-bold text-white tabular-nums">
                {totalPallets}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center border border-slate-300 text-slate-700 md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block px-3 py-2.5 text-sm font-medium",
                pathname === link.href
                  ? "text-red-600"
                  : "text-slate-700 hover:text-slate-900",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
