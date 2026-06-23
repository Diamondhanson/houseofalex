import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Boxes, ShieldCheck, Truck } from "lucide-react";
import { getStorefrontPallet, getStorefrontPallets } from "@/lib/data/pallets-source";
import { getCategories } from "@/lib/data/categories-source";
import { prettifyCategoryId } from "@/lib/data/catalog";
import { PalletPurchasePanel } from "@/components/shop/PalletPurchasePanel";
import { PalletGallery } from "@/components/shop/PalletGallery";
import { PalletCard } from "@/components/shop/PalletCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pallet = await getStorefrontPallet(id);
  if (!pallet) return { title: "Pallet not found" };
  return {
    title: pallet.name,
    description: `${pallet.name} - ${pallet.pieces} units from ${pallet.brands.join(", ")}. ${pallet.condition}.`,
  };
}

const TRUST = [
  { icon: BadgeCheck, label: "Authenticated, original-source stock" },
  { icon: ShieldCheck, label: "Sealed units, traceable provenance" },
  { icon: Truck, label: "Pallet dispatch in 48–72h" },
];

export default async function PalletDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pallet = await getStorefrontPallet(id);
  if (!pallet) notFound();

  const [categories, allPallets] = await Promise.all([
    getCategories(),
    getStorefrontPallets(),
  ]);
  const catLabel =
    categories.find((c) => c.id === pallet.categoryId)?.label ??
    prettifyCategoryId(pallet.categoryId);
  const related = allPallets
    .filter((p) => p.categoryId === pallet.categoryId && p.id !== pallet.id)
    .slice(0, 3);

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-sm text-slate-500">
            <Link href="/shop" className="transition-colors hover:text-red-600">
              Shop
            </Link>
            <span>/</span>
            <Link
              href={`/shop?category=${pallet.categoryId}`}
              className="transition-colors hover:text-red-600"
            >
              {catLabel}
            </Link>
            <span>/</span>
            <span className="text-slate-900">{pallet.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-red-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to catalogue
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Image */}
          <div>
            <PalletGallery
              images={pallet.images && pallet.images.length ? pallet.images : [pallet.image]}
              alt={pallet.name}
              badge={catLabel}
            />

            {/* Trust strip */}
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-3">
              {TRUST.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-start gap-2 border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600"
                >
                  <Icon className="h-4 w-4 shrink-0 text-red-600" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Details + purchase */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{pallet.name}</h1>
            <p className="mt-3 leading-relaxed text-slate-600">
              A ready-to-ship {catLabel.toLowerCase()} pallet containing{" "}
              <span className="font-medium text-slate-900">{pallet.pieces} units</span> of mixed,
              authenticated stock. {pallet.condition}. Supplied with export documentation and
              dispatched from our EU or UK hub.
            </p>

            {/* Brands */}
            <div className="mt-6">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Boxes className="h-4 w-4 text-red-600" />
                Representative brands in this pallet
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {pallet.brands.map((b) => (
                  <span
                    key={b}
                    className="border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700"
                  >
                    {b}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Exact assortment varies per pallet; brand mix is representative.
              </p>
            </div>

            <div className="mt-7">
              <PalletPurchasePanel pallet={pallet} />
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-slate-200 pt-10">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              More {catLabel.toLowerCase()} pallets
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PalletCard key={p.id} pallet={p} categoryLabel={catLabel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
