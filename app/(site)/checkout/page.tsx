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
import { getCategory, prettifyCategoryId } from "@/lib/data/catalog";
import { formatGBP } from "@/lib/format";
import { whatsappLink } from "@/lib/data/contact";
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

  // --- Build a human-readable order summary for WhatsApp -------------------
  function buildWhatsAppMessage() {
    const itemLines = lines.map(({ pallet, qty }) => {
      const catLabel =
        getCategory(pallet.categoryId)?.label ?? prettifyCategoryId(pallet.categoryId);
      return `• ${pallet.name} (${catLabel}) — ${qty} × ${formatGBP(pallet.price)} = ${formatGBP(
        pallet.price * qty,
      )}`;
    });

    const details = [
      business.contactName && `Name: ${business.contactName}`,
      business.email && `Email: ${business.email}`,
      business.phone && `WhatsApp: ${business.phone}`,
      business.notes && `Notes: ${business.notes}`,
    ].filter(Boolean);

    return [
      "Hi House of Alex, I'd like to place a wholesale order:",
      "",
      ...itemLines,
      "",
      `Pallets: ${totalPallets}`,
      `Total units: ${totalUnits}`,
      `Order total: ${formatGBP(totalCost)}`,
      ...(details.length ? ["", ...details] : []),
    ].join("\n");
  }

  // --- Open WhatsApp prefilled with the order ------------------------------
  function handleWhatsAppOrder() {
    if (typeof window !== "undefined") {
      window.open(whatsappLink(buildWhatsAppMessage()), "_blank", "noopener,noreferrer");
    }
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
            Cart
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
                    const catLabel =
                      getCategory(pallet.categoryId)?.label ??
                      prettifyCategoryId(pallet.categoryId);
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
                                {catLabel} · {pallet.pieces} units
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
              <Field label="WhatsApp number" required>
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
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Submitting…" : "Place Wholesale Order"}
              </Button>
              <Button
                type="button"
                variant="whatsapp"
                size="lg"
                onClick={handleWhatsAppOrder}
                className="w-full"
              >
                <WhatsAppGlyph className="h-5 w-5" />
                Place Order on WhatsApp
              </Button>
            </div>
            <p className="mt-3 text-center text-[11px] text-slate-500">
              By submitting you confirm these are trade-only B2B purchase intentions.
            </p>

            {/* WhatsApp encouragement notice */}
            <div className="mt-4 flex items-start gap-2.5 border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-3 text-sm text-slate-700">
              <WhatsAppGlyph className="mt-0.5 h-4 w-4 shrink-0 text-[#25D366]" />
              <p>
                <span className="font-semibold text-slate-900">Ordering on WhatsApp is fastest.</span>{" "}
                It&apos;s our most reliable and prompt channel, so you&apos;ll get a quicker response
                and direct, personal support from our team throughout your order.
              </p>
            </div>
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

// lucide doesn't ship a WhatsApp brand glyph, so inline the official mark.
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

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
