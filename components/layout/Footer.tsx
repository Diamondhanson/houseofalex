import Link from "next/link";
import { Globe2, ShieldCheck, Truck, Warehouse } from "lucide-react";
import { CONTACT, mailtoLink, telLink, whatsappLink } from "@/lib/data/contact";
import { SocialLinks } from "@/components/ui/SocialLinks";

const HIGHLIGHTS = [
  { icon: Warehouse, label: "120,000 sq ft EU bonded warehousing" },
  { icon: Truck, label: "Pan-EU & UK pallet dispatch in 48–72h" },
  { icon: ShieldCheck, label: "Authenticated, original-source stock" },
  { icon: Globe2, label: "Export documentation handled in-house" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand + highlights */}
          <div>
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.png" alt="House of Alex" className="h-9 w-9 object-contain" />
              <span className="text-lg font-bold tracking-tight text-slate-900">
                House of Alex
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
              A B2B wholesale and clearance stock supplier, providing authenticated,
              original premium stock to resellers, distributors and retail groups - by
              the pallet, with transparent volume pricing.
            </p>
            <ul className="mt-6 grid gap-2.5">
              {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Icon className="h-4 w-4 shrink-0 text-red-600" />
                  {label}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Follow & message us
              </h3>
              <SocialLinks className="mt-3" />
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Navigate
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { href: "/shop", label: "Shop Pallets" },
                { href: "/about", label: "About the House" },
                { href: "/contact", label: "Contact & Support" },
                { href: "/checkout", label: "Cart & Invoice" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-slate-600 transition-colors hover:text-red-600"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Operations / admin */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Operations
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li>
                <a href={telLink} className="transition-colors hover:text-red-600">
                  Call or text: {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-red-600"
                >
                  WhatsApp: {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={mailtoLink} className="transition-colors hover:text-red-600">
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 font-semibold text-red-600 transition-colors hover:text-red-700"
                >
                  Admin Portal →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} House of Alex Trading. All rights reserved.</p>
          <p className="flex flex-wrap gap-x-5 gap-y-2">
            <span>VAT-registered EU wholesaler</span>
            <span>B2B trade-only · No consumer sales</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
