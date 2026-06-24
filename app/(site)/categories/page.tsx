import type { Metadata } from "next";
import { getCategories } from "@/lib/data/categories-source";
import { CategoryCard } from "@/components/shop/CategoryCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse every wholesale and clearance stock category, from perfumes and cosmetics to clothing, electronics and collectibles. Pick a category to see its offers.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="bg-white">
      {/* Page header */}
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
            Browse
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            All categories
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Explore the full range of wholesale and clearance stock. Pick a category to see
            its offers.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {categories.length === 0 ? (
          <p className="py-16 text-center text-slate-500">No categories yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
