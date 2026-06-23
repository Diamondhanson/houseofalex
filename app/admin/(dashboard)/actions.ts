"use server";

import { revalidatePath } from "next/cache";
import { getServiceSupabase } from "@/lib/supabase/server";
import { getServerAuthClient } from "@/lib/supabase/server-auth";
import { uploadImage } from "@/lib/supabase/storage";
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

export interface CategoryInput {
  label: string;
  tagline: string;
  image: string;
}

export interface ActionResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export interface UploadResult {
  ok: boolean;
  url?: string;
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

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "category";

// ----------------------------- Image upload -----------------------------

export async function uploadPalletImage(formData: FormData): Promise<UploadResult> {
  const denied = await assertAdmin();
  if (denied) return { ok: false, error: denied };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file received." };

  try {
    const url = await uploadImage(file);
    return { ok: true, url };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed.";
    return { ok: false, error: message };
  }
}

// ------------------------------- Categories -----------------------------

async function uniqueCategoryId(
  supabase: ReturnType<typeof getServiceSupabase>,
  base: string,
): Promise<string> {
  let id = base;
  let n = 2;
  // Cheap loop; category counts are tiny.
  for (;;) {
    const { data } = await supabase.from("categories").select("id").eq("id", id).maybeSingle();
    if (!data) return id;
    id = `${base}-${n++}`;
  }
}

export async function createCategory(input: CategoryInput): Promise<ActionResult> {
  const denied = await assertAdmin();
  if (denied) return { ok: false, error: denied };

  const label = input.label.trim();
  if (!label) return { ok: false, error: "Category name is required." };

  const supabase = getServiceSupabase();
  const id = await uniqueCategoryId(supabase, slugify(label));
  const { error } = await supabase.from("categories").insert({
    id,
    label,
    tagline: input.tagline.trim() || null,
    image: input.image.trim() || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidateStorefront();
  return { ok: true, id };
}

export async function updateCategory(id: string, input: CategoryInput): Promise<ActionResult> {
  const denied = await assertAdmin();
  if (denied) return { ok: false, error: denied };

  const label = input.label.trim();
  if (!label) return { ok: false, error: "Category name is required." };

  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from("categories")
    .update({
      label,
      tagline: input.tagline.trim() || null,
      image: input.image.trim() || null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateStorefront();
  return { ok: true, id };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const denied = await assertAdmin();
  if (denied) return { ok: false, error: denied };

  // The pallets FK is ON DELETE SET NULL, so any offers in this category become
  // uncategorised rather than blocking the delete.
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateStorefront();
  return { ok: true, id };
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
