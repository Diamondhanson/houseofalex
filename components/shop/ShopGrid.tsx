"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/data/catalog";
import { usePallet } from "@/lib/context/PalletContext";
import { formatGBP } from "@/lib/format";
import { PalletCard } from "@/components/shop/PalletCard";
import { cn } from "@/lib/cn";
import type { CategoryId, Pallet } from "@/lib/types";

type Filter = "all" | CategoryId;

export function ShopGrid({
  initialCategory,
  allPallets,
}: {
  initialCategory: Filter;
  allPallets: Pallet[];
}) {
  const [filter, setFilter] = useState<Filter>(initialCategory);
  const { totalPallets, totalCost } = usePallet();

  const pallets = useMemo(
    () => (filter === "all" ? allPallets : allPallets.filter((p) => p.categoryId === filter)),
    [filter, allPallets],
  );

  const tabs: Array<{ id: Filter; label: string }> = [
    { id: "all", label: "All Pallets" },
    ...CATEGORIES.map((c) => ({ id: c.id as Filter, label: c.label })),
  ];

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={cn(
                "border px-3.5 py-2 text-sm font-medium transition-colors",
                filter === t.id
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className="text-sm text-slate-500">
          {pallets.length} pallet{pallets.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Grid */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pallets.map((p) => (
          <PalletCard key={p.id} pallet={p} />
        ))}
      </div>

      {/* Sticky cart summary bar */}
      {totalPallets > 0 && (
        <div className="sticky bottom-4 z-40 mt-8">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 border border-slate-300 bg-white px-5 py-3 shadow-lg">
            <div className="text-sm">
              <span className="font-semibold text-slate-900">
                {totalPallets} pallet{totalPallets === 1 ? "" : "s"}
              </span>
              <span className="text-slate-500"> · {formatGBP(totalCost)}</span>
            </div>
            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              View Cart
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
