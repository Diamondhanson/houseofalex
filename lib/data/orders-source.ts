import "server-only";

// Reads real orders from Supabase for the admin dashboard, mapped onto the
// AdminOrder shape the table already renders.

import { getServiceSupabase } from "@/lib/supabase/server";
import type { AdminOrder, OrderStatus } from "@/lib/types";

interface OrderRow {
  reference: string;
  company: string;
  contact_name: string;
  total_pallets: number;
  total_units: number;
  total_cost: number | string;
  status: OrderStatus;
  created_at: string;
  order_lines: Array<{ name: string; quantity: number }> | null;
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("orders")
      .select("reference, company, contact_name, total_pallets, total_units, total_cost, status, created_at, order_lines(name, quantity)")
      .order("created_at", { ascending: false });
    if (error) throw error;

    return (data as OrderRow[]).map((o) => ({
      reference: o.reference,
      company: o.company,
      contactName: o.contact_name,
      tierName: `${o.total_pallets} pallet${o.total_pallets === 1 ? "" : "s"}`,
      pieces: o.total_units,
      total: Number(o.total_cost),
      status: o.status,
      placedAt: o.created_at,
      breakdown: (o.order_lines ?? []).map((l) => `${l.name} ×${l.quantity}`),
    }));
  } catch (e) {
    console.error("[orders-source] getAdminOrders error:", e);
    return [];
  }
}
