"use client";

import Link from "next/link";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { usePallet } from "@/lib/context/PalletContext";
import { getCategory } from "@/lib/data/catalog";
import { formatGBP } from "@/lib/format";
import type { Pallet } from "@/lib/types";

export function PalletCard({ pallet }: { pallet: Pallet }) {
  const { qtyOf, add, remove } = usePallet();
  const qty = qtyOf(pallet.id);
  const category = getCategory(pallet.categoryId);
  const href = `/shop/${pallet.id}`;

  return (
    <article className="flex flex-col border border-slate-200 bg-white transition-colors hover:border-slate-300">
      {/* Image - links to detail */}
      <Link href={href} className="group relative block aspect-[4/3] overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pallet.image}
          alt={pallet.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-0 top-0 bg-slate-900 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
          {category?.label}
        </span>
        <span className="absolute right-0 top-0 bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white">
          {pallet.pieces} units
        </span>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold leading-tight text-slate-900">
          <Link href={href} className="transition-colors hover:text-red-600">
            {pallet.name}
          </Link>
        </h3>
        <p className="mt-1 text-xs text-slate-500">{pallet.condition}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {pallet.brands.slice(0, 4).map((b) => (
            <span
              key={b}
              className="border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-600"
            >
              {b}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <div className="text-xl font-bold text-slate-900">{formatGBP(pallet.price)}</div>
            <div className="text-xs text-slate-500">
              {formatGBP(pallet.unitPrice)} / unit
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="mt-4">
          {qty === 0 ? (
            <button
              type="button"
              onClick={() => add(pallet)}
              className="flex h-11 w-full items-center justify-center gap-2 bg-red-600 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>
          ) : (
            <div className="flex h-11 items-stretch border border-slate-300">
              <button
                type="button"
                onClick={() => remove(pallet.id)}
                aria-label="Remove one"
                className="flex w-11 items-center justify-center text-slate-700 transition-colors hover:bg-slate-100"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex flex-1 items-center justify-center gap-1.5 border-x border-slate-300 text-sm font-semibold text-slate-900">
                <Check className="h-3.5 w-3.5 text-red-600" />
                {qty} in cart
              </span>
              <button
                type="button"
                onClick={() => add(pallet)}
                aria-label="Add one"
                className="flex w-11 items-center justify-center text-slate-700 transition-colors hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
