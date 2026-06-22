"use server";

import { getServiceSupabase } from "@/lib/supabase/server";
import { getPalletsByIds } from "@/lib/data/pallets-source";
import { getResend, FROM_EMAIL, ORDER_INBOX_EMAIL } from "@/lib/resend";
import { formatGBP } from "@/lib/format";
import type { BusinessDetails } from "@/lib/types";

interface OrderItemInput {
  palletId: string;
  quantity: number;
}

export interface PlaceOrderResult {
  ok: boolean;
  reference?: string;
  error?: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Server-authoritative order submission:
//   1. Recompute every price from the pallets table (never trust the client).
//   2. Email the owner via Resend.
//   3. Persist the order to Supabase (best-effort).
export async function placeOrder(input: {
  items: OrderItemInput[];
  business: BusinessDetails;
}): Promise<PlaceOrderResult> {
  const { items, business } = input;

  if (!items?.length) return { ok: false, error: "Your cart is empty." };
  if (!business?.email?.trim() || !business?.contactName?.trim()) {
    return { ok: false, error: "Please provide a contact name and email." };
  }

  // --- Recompute from authoritative pallet data ---
  const pallets = await getPalletsByIds(items.map((i) => i.palletId));
  const byId = new Map(pallets.map((p) => [p.id, p]));

  const lines = items
    .map((it) => {
      const p = byId.get(it.palletId);
      if (!p) return null;
      const qty = Math.max(1, Math.floor(it.quantity));
      return { pallet: p, qty, lineTotal: p.price * qty };
    })
    .filter((l): l is { pallet: (typeof pallets)[number]; qty: number; lineTotal: number } => l !== null);

  if (!lines.length) return { ok: false, error: "None of the selected pallets are available." };

  const totalPallets = lines.reduce((s, l) => s + l.qty, 0);
  const totalUnits = lines.reduce((s, l) => s + l.qty * l.pallet.pieces, 0);
  const totalCost = lines.reduce((s, l) => s + l.lineTotal, 0);
  const reference = `HOA-${Math.floor(10000 + Math.random() * 89999)}`;

  // --- Email the owner (the primary requirement) ---
  try {
    if (!ORDER_INBOX_EMAIL) throw new Error("ORDER_INBOX_EMAIL is not configured.");
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ORDER_INBOX_EMAIL,
      replyTo: business.email,
      subject: `New wholesale order ${reference} - ${formatGBP(totalCost)}`,
      html: orderEmailHtml({ reference, business, lines, totalPallets, totalUnits, totalCost }),
    });
    if (error) throw error;
  } catch (e) {
    console.error("[placeOrder] email failed:", e);
    return {
      ok: false,
      error: "We couldn't submit your order right now. Please try again shortly.",
    };
  }

  // --- Persist to Supabase (best-effort; email already sent) ---
  try {
    const supabase = getServiceSupabase();
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        reference,
        company: business.company || business.contactName,
        contact_name: business.contactName,
        email: business.email,
        phone: business.phone || null,
        vat_number: business.vatNumber || null,
        address_line1: business.addressLine1 || null,
        city: business.city || null,
        postcode: business.postcode || null,
        country: business.country || null,
        notes: business.notes || null,
        total_pallets: totalPallets,
        total_units: totalUnits,
        total_cost: totalCost,
      })
      .select("id")
      .single();
    if (error) throw error;

    if (order) {
      const rows = lines.map((l) => ({
        order_id: order.id,
        pallet_id: UUID_RE.test(l.pallet.id) ? l.pallet.id : null,
        name: l.pallet.name,
        pieces: l.pallet.pieces,
        unit_price: l.pallet.price,
        quantity: l.qty,
        line_total: l.lineTotal,
      }));
      const { error: lineErr } = await supabase.from("order_lines").insert(rows);
      if (lineErr) throw lineErr;
    }
  } catch (e) {
    console.error("[placeOrder] persistence failed (order was emailed):", e);
  }

  return { ok: true, reference };
}

function orderEmailHtml(o: {
  reference: string;
  business: BusinessDetails;
  lines: Array<{ pallet: { name: string; pieces: number; price: number }; qty: number; lineTotal: number }>;
  totalPallets: number;
  totalUnits: number;
  totalCost: number;
}): string {
  const rows = o.lines
    .map(
      (l) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;">${l.pallet.name}<br><span style="color:#64748b;font-size:12px;">${l.pallet.pieces} units · ${formatGBP(l.pallet.price)} ea</span></td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:#0f172a;">${l.qty}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;color:#0f172a;font-weight:bold;">${formatGBP(l.lineTotal)}</td>
      </tr>`,
    )
    .join("");

  const b = o.business;
  const detail = (label: string, value?: string) =>
    value ? `<tr><td style="padding:2px 0;color:#64748b;width:120px;">${label}</td><td style="padding:2px 0;color:#0f172a;">${value}</td></tr>` : "";

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0;font-family:Helvetica,Arial,sans-serif;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e2e8f0;">
        <tr><td style="background:#dc2626;padding:16px 24px;color:#ffffff;font-size:16px;font-weight:bold;">House of Alex - New wholesale order</td></tr>
        <tr><td style="padding:24px;">
          <p style="margin:0 0 4px 0;font-size:14px;color:#475569;">Reference</p>
          <p style="margin:0 0 20px 0;font-size:20px;font-weight:bold;color:#0f172a;">${o.reference}</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-collapse:collapse;margin-bottom:20px;">
            <thead><tr style="background:#f8fafc;">
              <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Pallet</th>
              <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Qty</th>
              <th style="padding:8px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Total</th>
            </tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr>
              <td style="padding:10px 12px;font-weight:bold;color:#0f172a;">${o.totalPallets} pallets · ${o.totalUnits} units</td>
              <td></td>
              <td style="padding:10px 12px;text-align:right;font-weight:bold;font-size:16px;color:#dc2626;">${formatGBP(o.totalCost)}</td>
            </tr></tfoot>
          </table>

          <p style="margin:0 0 8px 0;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Customer</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;">
            ${detail("Contact", b.contactName)}
            ${detail("Email", b.email)}
            ${detail("Phone", b.phone)}
            ${detail("Company", b.company)}
            ${detail("City", b.city)}
            ${detail("Notes", b.notes)}
          </table>
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #e2e8f0;background:#f8fafc;font-size:11px;color:#94a3b8;">
          No payment was taken online. Reply to this email to send the buyer a proforma invoice.
        </td></tr>
      </table>
    </td></tr>
  </table>`;
}
