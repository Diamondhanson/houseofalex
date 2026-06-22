"use server";

import { revalidatePath } from "next/cache";
import { getServiceSupabase } from "@/lib/supabase/server";
import { getServerAuthClient } from "@/lib/supabase/server-auth";
import { isAllowedAdmin } from "@/lib/admin";

export interface PalletInput {
  name: string;
  categoryId: string;
  pieces: number;
  unitPrice: number;
  price: number;
  brands: string[];
  condition: string;
  images: string[];
  active: boolean;
}

export interface ActionResult {
  ok: boolean;
  id?: string;
  error?: string;
}

// Verify the caller is a signed-in, allowlisted admin before any write.
async function assertAdmin(): Promise<string | null> {
  const supabase = await getServerAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAllowedAdmin(user.email)) return "Not authorized.";
  return null;
}

function toRow(p: PalletInput) {
  return {
    name: p.name.trim(),
    category_id: p.categoryId,
    pieces: Math.max(1, Math.floor(p.pieces)),
    unit_price: Number(p.unitPrice),
    price: Number(p.price),
    brands: p.brands,
    condition: p.condition,
    images: p.images.filter((s) => s.trim()).slice(0, 4),
    active: p.active,
  };
}

function revalidateStorefront() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin");
}

export async function createPallet(input: PalletInput): Promise<ActionResult> {
  const denied = await assertAdmin();
  if (denied) return { ok: false, error: denied };
  if (!input.name.trim()) return { ok: false, error: "Name is required." };

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("pallets")
    .insert(toRow(input))
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidateStorefront();
  return { ok: true, id: data.id };
}

export async function updatePallet(id: string, input: PalletInput): Promise<ActionResult> {
  const denied = await assertAdmin();
  if (denied) return { ok: false, error: denied };

  const supabase = getServiceSupabase();
  const { error } = await supabase.from("pallets").update(toRow(input)).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateStorefront();
  return { ok: true, id };
}

export async function deletePallet(id: string): Promise<ActionResult> {
  const denied = await assertAdmin();
  if (denied) return { ok: false, error: denied };

  const supabase = getServiceSupabase();
  const { error } = await supabase.from("pallets").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateStorefront();
  return { ok: true, id };
}

export async function setPalletActive(id: string, active: boolean): Promise<ActionResult> {
  const denied = await assertAdmin();
  if (denied) return { ok: false, error: denied };

  const supabase = getServiceSupabase();
  const { error } = await supabase.from("pallets").update({ active }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateStorefront();
  return { ok: true, id };
}
