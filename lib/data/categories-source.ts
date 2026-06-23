import "server-only";

// Server-side category list, backed by Supabase. The storefront and admin read
// through this so admin-created categories appear live. Falls back to the
// static seed if the DB is empty or unreachable, so the site never breaks.

import { getServiceSupabase } from "@/lib/supabase/server";
import { CATEGORIES as STATIC_CATEGORIES } from "@/lib/data/catalog";
import type { Category } from "@/lib/types";

interface CategoryRow {
  id: string;
  label: string;
  tagline: string | null;
  image: string | null;
}

const rowToCategory = (r: CategoryRow): Category => ({
  id: r.id,
  label: r.label,
  tagline: r.tagline ?? "",
  image: r.image ?? "",
});

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("categories")
      .select("id,label,tagline,image")
      .order("created_at", { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return STATIC_CATEGORIES;
    return (data as CategoryRow[]).map(rowToCategory);
  } catch (e) {
    console.error("[categories-source] getCategories fell back to static:", e);
    return STATIC_CATEGORIES;
  }
}
