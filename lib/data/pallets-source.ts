import "server-only";

// Server-side pallet catalogue, backed by Supabase. The storefront reads
// through these helpers so admin-uploaded pallets appear live. If the DB is
// ever unreachable we fall back to the static seed so the site never breaks.

import { getServiceSupabase } from "@/lib/supabase/server";
import { PALLETS as STATIC_PALLETS, getPallet as getStaticPallet } from "@/lib/data/pallets";
import type { CategoryId, Pallet } from "@/lib/types";

interface PalletRow {
  id: string;
  name: string;
  category_id: CategoryId | null;
  pieces: number;
  unit_price: number | string;
  price: number | string;
  brands: string[] | null;
  condition: string | null;
  images: string[] | null;
  active: boolean;
}

function rowToPallet(row: PalletRow): Pallet {
  const images = row.images ?? [];
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id ?? "",
    pieces: row.pieces,
    unitPrice: Number(row.unit_price),
    price: Number(row.price),
    brands: row.brands ?? [],
    condition: row.condition ?? "",
    image: images[0] ?? "",
    images,
    active: row.active,
  };
}

/** Active pallets for the public storefront. Falls back to the static seed. */
export async function getStorefrontPallets(): Promise<Pallet[]> {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("pallets")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return STATIC_PALLETS;
    return (data as PalletRow[]).map(rowToPallet);
  } catch (e) {
    console.error("[pallets-source] getStorefrontPallets fell back to static:", e);
    return STATIC_PALLETS;
  }
}

/** All pallets (active + hidden) for the admin dashboard. */
export async function getAdminPallets(): Promise<Pallet[]> {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("pallets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as PalletRow[]).map(rowToPallet);
  } catch (e) {
    console.error("[pallets-source] getAdminPallets fell back to static:", e);
    return STATIC_PALLETS;
  }
}

/** A single active pallet for the detail page. */
export async function getStorefrontPallet(id: string): Promise<Pallet | null> {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("pallets")
      .select("*")
      .eq("id", id)
      .eq("active", true)
      .maybeSingle();
    if (error) throw error;
    if (data) return rowToPallet(data as PalletRow);
  } catch (e) {
    console.error("[pallets-source] getStorefrontPallet error:", e);
  }
  // fallback to static seed by id
  const s = getStaticPallet(id);
  return s ?? null;
}

/** Authoritative pricing source for order recompute. */
export async function getPalletsByIds(ids: string[]): Promise<Pallet[]> {
  if (ids.length === 0) return [];
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.from("pallets").select("*").in("id", ids);
    if (error) throw error;
    if (data && data.length > 0) return (data as PalletRow[]).map(rowToPallet);
  } catch (e) {
    console.error("[pallets-source] getPalletsByIds error:", e);
  }
  return STATIC_PALLETS.filter((p) => ids.includes(p.id));
}
