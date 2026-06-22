"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Info,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { usePallet } from "@/lib/context/PalletContext";
import { getCategory } from "@/lib/data/catalog";
import { formatGBP } from "@/lib/format";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { placeOrder } from "./actions";
import type { BusinessDetails } from "@/lib/types";

const EMPTY_BUSINESS: BusinessDetails = {
  company: "",
  contactName: "",
  email: "",
  phone: "",
  vatNumber: "",
  addressLine1: "",
  city: "",
  postcode: "",
  country: "",
  notes: "",
};

export default function CheckoutPage() {
  const {
    lines,
    totalPallets,
    totalUnits,
    totalCost,
    add,
    remove,
    setQty,
    clear,
    orderItems,
  } = usePallet();
  const [business, setBusiness] = useState<BusinessDetails>(EMPTY_BUSINESS);
  const [placed, setPlaced] = useState<{ reference: string; email: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Submit: server recomputes prices, emails the owner, persists ---------
  async function handlePlaceOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await placeOrder({ items: orderItems(), business });

    setSubmitting(false);
    if (!result.ok || !result.reference) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    setPlaced({ reference: result.reference, email: business.email });
    clear();
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // --- Success state -------------------------------------------------------
  if (placed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="border border-emerald-200 bg-emerald-50 p-8 text-center sm:p-12">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-9 w-9" />
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Order received
          </h1>
          <p className="mt-3 text-slate-600">
            Reference{" "}
            <span className="font-mono font-semibold text-emerald-700">{placed.reference}</span>.
            Your order has been received by our team. We&apos;ll be in touch shortly at{" "}
            <span className="font-medium text-slate-900">{placed.email}</span> to confirm.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/shop">Continue shopping</ButtonLink>
            <ButtonLink href="/" variant="secondary">
              Back to home
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  // --- Empty cart ----------------------------------------------------------
  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="border border-slate-200 bg-white p-10 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <ShoppingCart className="h-8 w-8" />
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
            Your cart is empty
          </h1>
          <p className="mt-3 text-slate-600">
            Browse the catalogue and add the pallets you need to request an invoice.
          </p>
          <div className="mt-8">
            <ButtonLink href="/shop">
              <ArrowLeft className="h-4 w-4" />
              Shop Pallets
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  // --- Checkout ------------------------------------------------------------
  return (
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-red-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue shopping
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Cart & invoice request
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Review your pallets and delivery details. No payment is taken - we&apos;ll issue a
            proforma invoice.
          </p>
        </div>
      </div>

      <form
        onSubmit={handlePlaceOrder}
        className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8"
      >
        {/* Cart + delivery details */}
        <div className="space-y-8">
          {/* Cart table */}
          <section className="border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-700">
                <FileText className="h-4 w-4 text-red-600" />
                Order Manifest
              </h2>
              <span className="text-xs font-medium text-slate-500">
                {totalPallets} pallet{totalPallets === 1 ? "" : "s"} · {totalUnits} units
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3 font-medium">Pallet</th>
                    <th className="px-5 py-3 text-center font-medium">Qty</th>
                    <th className="px-5 py-3 text-right font-medium">Pallet price</th>
                    <th className="px-5 py-3 text-right font-medium">Line total</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {lines.map(({ pallet, qty }) => {
                    const category = getCategory(pallet.categoryId);
                    return (
                      <tr key={pallet.id}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={pallet.image}
                              alt={pallet.name}
                              loading="lazy"
                              className="h-14 w-14 shrink-0 border border-slate-200 object-cover"
                            />
                            <div>
                              <div className="font-medium text-slate-900">{pallet.name}</div>
                              <div className="text-xs text-slate-500">
                                {category?.label} · {pallet.pieces} units
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="mx-auto flex h-9 w-28 items-stretch border border-slate-300">
                            <button
                              type="button"
                              onClick={() => remove(pallet.id)}
                              aria-label="Decrease"
                              className="flex w-9 items-center justify-center text-slate-700 hover:bg-slate-100"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <input
                              value={qty}
                              onChange={(e) =>
                                setQty(pallet, Number(e.target.value.replace(/\D/g, "")) || 0)
                              }
                              inputMode="numeric"
                              className="w-full border-x border-slate-300 text-center text-sm font-semibold text-slate-900 focus:outline-none"
                              aria-label={`Quantity of ${pallet.name}`}
                            />
                            <button
                              type="button"
                              onClick={() => add(pallet)}
                              aria-label="Increase"
                              className="flex w-9 items-center justify-center text-slate-700 hover:bg-slate-100"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right tabular-nums text-slate-600">
                          {formatGBP(pallet.price)}
                        </td>
                        <td className="px-5 py-4 text-right font-semibold tabular-nums text-slate-900">
                          {formatGBP(pallet.price * qty)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setQty(pallet, 0)}
                            className="text-slate-400 transition-colors hover:text-red-600"
                            aria-label={`Remove ${pallet.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Business / delivery form */}
          <section className="border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
              Business & delivery details
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Contact name" required>
                <input
                  required
                  value={business.contactName}
                  onChange={(e) => setBusiness({ ...business, contactName: e.target.value })}
                  className={inputCls}
                  placeholder="Jane Doe"
                />
              </Field>
              <Field label="Email" required>
                <input
                  required
                  type="email"
                  value={business.email}
                  onChange={(e) => setBusiness({ ...business, email: e.target.value })}
                  className={inputCls}
                  placeholder="you@company.com"
                />
              </Field>
              <Field label="Phone" required>
                <PhoneInput
                  value={business.phone}
                  onChange={(v) => setBusiness({ ...business, phone: v })}
                  required
                />
              </Field>
              <Field label="Order notes" className="sm:col-span-2">
                <textarea
                  rows={3}
                  value={business.notes}
                  onChange={(e) => setBusiness({ ...business, notes: e.target.value })}
                  className={`${inputCls} resize-none`}
                  placeholder="Delivery windows, consolidation requests, references…"
                />
              </Field>
            </div>
          </section>

          {/* Submit - below the form */}
          <div>
            {error && (
              <div className="mb-3 border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Submitting…" : "Place Wholesale Order"}
            </Button>
            <p className="mt-3 text-center text-[11px] text-slate-500">
              By submitting you confirm these are trade-only B2B purchase intentions.
            </p>
          </div>
        </div>

        {/* Order summary - no payment layer */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
              Order summary
            </h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Pallets</dt>
                <dd className="font-medium tabular-nums text-slate-900">{totalPallets}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Total units</dt>
                <dd className="font-medium tabular-nums text-slate-900">{totalUnits}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3">
                <dt className="font-semibold text-slate-900">Order total</dt>
                <dd className="text-xl font-bold tabular-nums text-red-600">
                  {formatGBP(totalCost)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
              <Info className="mb-1 inline h-3.5 w-3.5 text-red-600" /> No payment is processed
              here. Submitting requests a manual proforma invoice from our trade desk.
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

const inputCls =
  "w-full border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500";

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </span>
      {children}
    </label>
  );
}
