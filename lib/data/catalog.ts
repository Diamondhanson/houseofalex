// Static dummy catalog. Swap these exports for Supabase queries later —
// the shapes intentionally mirror what a `categories` / `brands` / `products`
// schema would return.

import type {
  Brand,
  Category,
  PalletTier,
  Product,
} from "@/lib/types";

export const PALLET_TIERS: PalletTier[] = [
  {
    id: "tier-40",
    name: "Starter Pallet",
    quantity: 40,
    unitPrice: 15.2,
    note: "Ideal first test order",
  },
  {
    id: "tier-60",
    name: "Trade Pallet",
    quantity: 60,
    unitPrice: 14.4,
    note: "Most popular volume tier",
  },
  {
    id: "tier-100",
    name: "Distributor Pallet",
    quantity: 100,
    unitPrice: 13.5,
    note: "Best per-unit margin",
  },
];

export const CATEGORIES: Category[] = [
  {
    id: "perfume-full",
    label: "Full-Size Perfumes",
    tagline: "Sealed designer EDP & EDT, 50–100ml retail flacons.",
    image:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "perfume-mini",
    label: "Mini Sets",
    tagline: "Travel & discovery sets — high sell-through gifting stock.",
    image:
      "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "makeup",
    label: "Makeup",
    tagline: "Branded cosmetics, palettes and complexion lines.",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=70",
  },
  {
    id: "shoes",
    label: "Branded Shoes",
    tagline: "Boxed footwear, mixed sizes, sport & lifestyle silhouettes.",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=70",
  },
];

export const BRANDS: Brand[] = [
  // Full-size perfumes
  { id: "creed", name: "Creed", categoryId: "perfume-full" },
  { id: "dior", name: "Dior", categoryId: "perfume-full" },
  { id: "chanel", name: "Chanel", categoryId: "perfume-full" },
  { id: "tom-ford", name: "Tom Ford", categoryId: "perfume-full" },
  // Mini sets
  { id: "versace", name: "Versace", categoryId: "perfume-mini" },
  { id: "paco-rabanne", name: "Paco Rabanne", categoryId: "perfume-mini" },
  { id: "ysl", name: "Yves Saint Laurent", categoryId: "perfume-mini" },
  // Makeup
  { id: "mac", name: "MAC", categoryId: "makeup" },
  { id: "charlotte-tilbury", name: "Charlotte Tilbury", categoryId: "makeup" },
  { id: "nars", name: "NARS", categoryId: "makeup" },
  // Shoes
  { id: "nike", name: "Nike", categoryId: "shoes" },
  { id: "adidas", name: "Adidas", categoryId: "shoes" },
  { id: "puma", name: "Puma", categoryId: "shoes" },
];

export const PRODUCTS: Product[] = [
  // Creed
  { id: "creed-aventus", name: "Aventus 100ml", brandId: "creed", categoryId: "perfume-full", rrp: 295 },
  { id: "creed-git", name: "Green Irish Tweed 100ml", brandId: "creed", categoryId: "perfume-full", rrp: 280 },
  { id: "creed-smw", name: "Silver Mountain Water 100ml", brandId: "creed", categoryId: "perfume-full", rrp: 270 },
  // Dior
  { id: "dior-sauvage", name: "Sauvage EDP 100ml", brandId: "dior", categoryId: "perfume-full", rrp: 115 },
  { id: "dior-homme", name: "Dior Homme Intense 100ml", brandId: "dior", categoryId: "perfume-full", rrp: 120 },
  { id: "dior-miss", name: "Miss Dior EDP 100ml", brandId: "dior", categoryId: "perfume-full", rrp: 130 },
  // Chanel
  { id: "chanel-bleu", name: "Bleu de Chanel 100ml", brandId: "chanel", categoryId: "perfume-full", rrp: 125 },
  { id: "chanel-coco", name: "Coco Mademoiselle 100ml", brandId: "chanel", categoryId: "perfume-full", rrp: 135 },
  { id: "chanel-no5", name: "No.5 EDP 100ml", brandId: "chanel", categoryId: "perfume-full", rrp: 140 },
  // Tom Ford
  { id: "tf-oud", name: "Oud Wood 50ml", brandId: "tom-ford", categoryId: "perfume-full", rrp: 215 },
  { id: "tf-tobacco", name: "Tobacco Vanille 50ml", brandId: "tom-ford", categoryId: "perfume-full", rrp: 225 },

  // Versace mini
  { id: "versace-mini-eros", name: "Eros Mini Trio Set", brandId: "versace", categoryId: "perfume-mini", rrp: 45 },
  { id: "versace-mini-women", name: "Bright Crystal Mini Set", brandId: "versace", categoryId: "perfume-mini", rrp: 42 },
  // Paco Rabanne mini
  { id: "paco-disc-1m", name: "1 Million Discovery Set", brandId: "paco-rabanne", categoryId: "perfume-mini", rrp: 38 },
  { id: "paco-disc-invictus", name: "Invictus Travel Duo", brandId: "paco-rabanne", categoryId: "perfume-mini", rrp: 36 },
  // YSL mini
  { id: "ysl-mini-libre", name: "Libre Travel Set", brandId: "ysl", categoryId: "perfume-mini", rrp: 48 },
  { id: "ysl-mini-myslf", name: "MYSLF Mini Duo", brandId: "ysl", categoryId: "perfume-mini", rrp: 44 },

  // MAC
  { id: "mac-ruby", name: "Ruby Woo Lipstick", brandId: "mac", categoryId: "makeup", rrp: 23 },
  { id: "mac-fix", name: "Fix+ Setting Spray", brandId: "mac", categoryId: "makeup", rrp: 21 },
  { id: "mac-studio", name: "Studio Fix Foundation", brandId: "mac", categoryId: "makeup", rrp: 32 },
  // Charlotte Tilbury
  { id: "ct-pillow", name: "Pillow Talk Lipstick", brandId: "charlotte-tilbury", categoryId: "makeup", rrp: 29 },
  { id: "ct-flawless", name: "Airbrush Flawless Foundation", brandId: "charlotte-tilbury", categoryId: "makeup", rrp: 39 },
  // NARS
  { id: "nars-orgasm", name: "Orgasm Blush", brandId: "nars", categoryId: "makeup", rrp: 30 },
  { id: "nars-radiant", name: "Radiant Longwear Foundation", brandId: "nars", categoryId: "makeup", rrp: 38 },

  // Nike
  { id: "nike-af1", name: "Air Force 1 (Mixed Sizes)", brandId: "nike", categoryId: "shoes", rrp: 110 },
  { id: "nike-dunk", name: "Dunk Low (Mixed Sizes)", brandId: "nike", categoryId: "shoes", rrp: 120 },
  // Adidas
  { id: "adidas-samba", name: "Samba OG (Mixed Sizes)", brandId: "adidas", categoryId: "shoes", rrp: 100 },
  { id: "adidas-gazelle", name: "Gazelle (Mixed Sizes)", brandId: "adidas", categoryId: "shoes", rrp: 95 },
  // Puma
  { id: "puma-suede", name: "Suede Classic (Mixed Sizes)", brandId: "puma", categoryId: "shoes", rrp: 75 },
  { id: "puma-rs", name: "RS-X (Mixed Sizes)", brandId: "puma", categoryId: "shoes", rrp: 90 },
];

// --- Lookup helpers -------------------------------------------------------

export const getCategory = (id: string) =>
  CATEGORIES.find((c) => c.id === id);

export const getBrand = (id: string) => BRANDS.find((b) => b.id === id);

export const getProduct = (id: string) =>
  PRODUCTS.find((p) => p.id === id);

export const getBrandsByCategory = (categoryId: string) =>
  BRANDS.filter((b) => b.categoryId === categoryId);

export const getProductsByBrand = (brandId: string) =>
  PRODUCTS.filter((p) => p.brandId === brandId);
