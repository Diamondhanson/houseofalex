import type { Metadata } from "next";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { getStorefrontPallets } from "@/lib/data/pallets-source";
import { getCategories } from "@/lib/data/categories-source";
import type { CategoryId } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Pallets",
  description:
    "Browse ready-to-ship wholesale pallets - perfumes, cosmetics and footwear. Add to cart and request a proforma invoice.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [allPallets, categories] = await Promise.all([
    getStorefrontPallets(),
    getCategories(),
  ]);
  const valid = new Set(categories.map((c) => c.id));
  const initialCategory: CategoryId | "all" =
    category && valid.has(category) ? category : "all";

  return (
    <div className="bg-white">
      {/* Page header */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
            Wholesale Catalogue
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Shop bulk pallets
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Fixed, ready-to-ship pallets of authenticated stock. Add what you need to
            your cart - no payment online, we issue a proforma invoice.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ShopGrid
          initialCategory={initialCategory}
          allPallets={allPallets}
          categories={categories}
        />
      </div>
    </div>
  );
}
