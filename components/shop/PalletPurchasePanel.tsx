"use client";

import Link from "next/link";
import { ArrowRight, Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { usePallet } from "@/lib/context/PalletContext";
import { formatGBP } from "@/lib/format";
import type { Pallet } from "@/lib/types";

export function PalletPurchasePanel({ pallet }: { pallet: Pallet }) {
  const { qtyOf, add, remove } = usePallet();
  const qty = qtyOf(pallet.id);

  return (
    <div className="border border-slate-200 bg-white p-6">
      <div className="flex items-end justify-between border-b border-slate-100 pb-5">
        <div>
          <div className="text-3xl font-bold tracking-tight text-slate-900">
            {formatGBP(pallet.price)}
          </div>
          <div className="mt-1 text-sm text-slate-500">
            {formatGBP(pallet.unitPrice)} / unit · {pallet.pieces} units per pallet
          </div>
        </div>
        <span className="bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
          {pallet.pieces} units
        </span>
      </div>

      <dl className="space-y-2.5 py-5 text-sm">
        <Row label="Units per pallet" value={`${pallet.pieces}`} />
        <Row label="Effective unit price" value={formatGBP(pallet.unitPrice)} />
        <Row label="Condition" value={pallet.condition} />
      </dl>

      {/* Add to cart */}
      {qty === 0 ? (
        <button
          type="button"
          onClick={() => add(pallet.id)}
          className="flex h-12 w-full items-center justify-center gap-2 bg-red-600 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex h-12 items-stretch border border-slate-300">
            <button
              type="button"
              onClick={() => remove(pallet.id)}
              aria-label="Remove one"
              className="flex w-12 items-center justify-center text-slate-700 transition-colors hover:bg-slate-100"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="flex flex-1 items-center justify-center gap-1.5 border-x border-slate-300 text-sm font-semibold text-slate-900">
              <Check className="h-3.5 w-3.5 text-red-600" />
              {qty} in cart
            </span>
            <button
              type="button"
              onClick={() => add(pallet.id)}
              aria-label="Add one"
              className="flex w-12 items-center justify-center text-slate-700 transition-colors hover:bg-slate-100"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <Link
            href="/checkout"
            className="flex h-12 w-full items-center justify-center gap-2 border border-slate-300 bg-white text-sm font-semibold text-slate-900 transition-colors hover:border-slate-400"
          >
            View Cart
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-slate-500">
        No payment online — checkout requests a proforma invoice.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900">{value}</dd>
    </div>
  );
}
