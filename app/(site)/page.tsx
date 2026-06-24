import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  Layers,
  ShoppingBag,
  TrendingDown,
  Truck,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { getStorefrontPallets } from "@/lib/data/pallets-source";
import { getCategories } from "@/lib/data/categories-source";
import { PalletCard } from "@/components/shop/PalletCard";
import { CategoryCard } from "@/components/shop/CategoryCard";
import { ImageRotator } from "@/components/ui/ImageRotator";

export const dynamic = "force-dynamic";

const HERO_IMAGES = [
  "/hero/hero-1.jpg",
  "/hero/hero-2.jpg",
  "/hero/hero-3.jpg",
  "/hero/hero-4.jpg",
];

const PROCESS = [
  {
    icon: Layers,
    step: "01",
    title: "Select a Bulk Pallet",
    body: "Browse fixed, ready-to-ship pallets by category. Each lists its unit count, brand mix and per-unit price.",
  },
  {
    icon: ShoppingBag,
    step: "02",
    title: "Build Your Order",
    body: "Add the pallets you want to your cart and adjust quantities - totals update instantly.",
  },
  {
    icon: ClipboardList,
    step: "03",
    title: "Receive Manual Invoice",
    body: "Submit your order. No online payment - our trade desk issues a proforma invoice for settlement.",
  },
];

const STATS = [
  { value: "98%", label: "Authenticated original stock" },
  { value: "48h", label: "Average dispatch window" },
  { value: "£13.50", label: "Per-unit from, at volume" },
  { value: "1,200+", label: "Pallets shipped to trade" },
];

export default async function HomePage() {
  const [allPallets, categories] = await Promise.all([
    getStorefrontPallets(),
    getCategories(),
  ]);
  const featured = allPallets.slice(0, 3);
  const labelOf = new Map(categories.map((c) => [c.id, c.label]));

  return (
    <div className="bg-white">
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-700">
              <Truck className="h-3.5 w-3.5" />
              Trade-only wholesale & clearance supply
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl">
              Original premium stock,{" "}
              <span className="text-red-600">priced by the pallet.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              House of Alex supplies authenticated perfumes, cosmetics and footwear to
              resellers and distributors. Browse ready-to-ship pallets with transparent
              volume pricing.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <ButtonLink href="/shop" size="lg">
                Shop Pallets
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/about" size="lg" variant="secondary">
                How it works
              </ButtonLink>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-red-600" /> Authenticated sourcing
              </span>
              <span className="inline-flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" /> Automated volume pricing
              </span>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative border border-slate-200">
            <ImageRotator
              images={HERO_IMAGES}
              alt="House of Alex wholesale and clearance stock"
              className="aspect-[4/3] w-full"
              interval={3500}
              eager
            />
            <div className="absolute bottom-0 left-0 z-10 bg-white px-4 py-3 shadow-sm">
              <div className="text-xs uppercase tracking-wider text-slate-500">From</div>
              <div className="text-lg font-bold text-slate-900">
                £13.50 <span className="text-sm font-medium text-slate-500">/ unit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats band */}
        <div className="border-t border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
            {STATS.map((s) => (
              <div key={s.label} className="px-2 py-6 text-center sm:py-7">
                <div className="text-2xl font-bold text-slate-900 sm:text-3xl">{s.value}</div>
                <div className="mt-1 text-xs text-slate-500 sm:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── FEATURED CATEGORIES ───────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Shop segments"
          title="Browse by category"
          subtitle="Jump straight into the assortment that fits your retail floor."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
        {categories.length > 6 && (
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/categories" variant="secondary" size="lg">
              View all categories
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        )}
      </section>

      {/* ───────────────────────── FEATURED PALLETS ───────────────────────── */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <SectionHeading
              eyebrow="Best sellers"
              title="Featured pallets"
              subtitle="Popular, high-margin stock ready to ship this week."
            />
            <Link
              href="/shop"
              className="hidden items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 sm:inline-flex"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PalletCard key={p.id} pallet={p} categoryLabel={labelOf.get(p.categoryId)} />
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── PROCESS ───────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The ordering flow"
          title="Three steps to a fulfilled order"
          subtitle="A streamlined, transparent process built for repeat trade buyers."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PROCESS.map(({ icon: Icon, step, title, body }) => (
            <div key={step} className="border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center bg-red-50 text-red-600">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-4xl font-bold text-slate-100">{step}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────────────── CTA ───────────────────────── */}
      <section className="border-t border-slate-200 bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Ready to place a wholesale order?
            </h2>
            <p className="mt-2 max-w-xl text-slate-300">
              No payment online. Add pallets to your cart, submit, and our trade desk
              follows up with a proforma invoice.
            </p>
          </div>
          <ButtonLink href="/shop" size="lg">
            Browse the Catalogue
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="max-w-2xl">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-slate-600">{subtitle}</p>
    </div>
  );
}
