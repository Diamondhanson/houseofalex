import type { Metadata } from "next";
import {
  BadgeCheck,
  Boxes,
  Globe2,
  Layers,
  ScrollText,
  ShieldCheck,
  Truck,
  Warehouse,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About",
  description:
    "House of Alex is a B2B wholesale liquidation house supplying authenticated premium stock to trade buyers.",
};

const ABOUT_IMG =
  "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1100&q=70";

const VALUES = [
  {
    icon: BadgeCheck,
    title: "Authenticated sourcing",
    body: "Every pallet is drawn from original-source, traceable stock - no grey-market substitutions.",
  },
  {
    icon: Layers,
    title: "Transparent volume pricing",
    body: "Per-unit pricing is fixed and shown up front. The more you take, the lower the unit cost.",
  },
  {
    icon: ScrollText,
    title: "Invoice-based settlement",
    body: "No online card capture. We issue a proforma invoice so finance teams stay in control.",
  },
  {
    icon: Truck,
    title: "Logistics handled in-house",
    body: "Consolidation, export documentation and pallet dispatch managed from our own hubs.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Select a Bulk Pallet",
    body: "Browse ready-to-ship pallets by category, each with its unit count and price.",
  },
  {
    n: "02",
    title: "Build Your Order",
    body: "Add pallets to your cart and adjust quantities - totals update instantly.",
  },
  {
    n: "03",
    title: "Receive Manual Invoice",
    body: "Submit the order; our trade desk returns a proforma invoice for settlement.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-700">
              <Boxes className="h-3.5 w-3.5" />
              About the House
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              A liquidation house built for serious trade buyers.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              House of Alex consolidates authenticated, original premium stock -
              perfumes, cosmetics and footwear - and makes it available to resellers and
              distributors by the pallet, with pricing that scales with volume.
            </p>
          </div>
          <div className="border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ABOUT_IMG}
              alt="Warehouse logistics"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-200">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { icon: Warehouse, value: "120k sq ft", label: "Bonded warehousing" },
            { icon: Globe2, value: "30+", label: "Export markets served" },
            { icon: ShieldCheck, value: "98%", label: "Authenticated stock" },
            { icon: Truck, value: "48–72h", label: "Dispatch window" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="px-2 py-8 text-center">
              <Icon className="mx-auto h-5 w-5 text-red-600" />
              <div className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{value}</div>
              <div className="mt-1 text-xs text-slate-500 sm:text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">How we operate</h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          Four principles keep our trade relationships predictable and repeatable.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="border border-slate-200 bg-white p-6">
              <span className="flex h-11 w-11 items-center justify-center bg-red-50 text-red-600">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">The ordering flow</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="border border-slate-200 bg-white p-6">
                <span className="text-4xl font-bold text-slate-200">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <ButtonLink href="/shop" size="lg">
              Shop the catalogue
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
