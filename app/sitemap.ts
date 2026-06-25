import type { MetadataRoute } from "next";
import { getCategories } from "@/lib/data/categories-source";
import { getStorefrontPallets } from "@/lib/data/pallets-source";

// Regenerate on each request so new products/categories appear automatically.
export const dynamic = "force-dynamic";

// Prefer the configured site URL, but never emit localhost in the sitemap.
const raw = process.env.NEXT_PUBLIC_SITE_URL || "";
const BASE = (raw && !raw.includes("localhost") ? raw : "https://houseofalexsupply.com").replace(
  /\/$/,
  "",
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let pallets: Awaited<ReturnType<typeof getStorefrontPallets>> = [];
  try {
    [categories, pallets] = await Promise.all([getCategories(), getStorefrontPallets()]);
  } catch {
    // If the DB is unreachable, still return the static routes.
  }

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/shop?category=${c.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = pallets.map((p) => ({
    url: `${BASE}/shop/${p.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
