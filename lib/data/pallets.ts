// Pallet products sold on the storefront. Each entry is a fixed, ready-to-ship
// bulk pallet — this is what the simple e-commerce grid lists. Swap for a
// Supabase `pallets` table later (shapes map 1:1).

import type { CategoryId, Pallet } from "@/lib/types";

// Curated Unsplash stock imagery (perfume / cosmetics / footwear / logistics).
const IMG = {
  perfumeDesigner:
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=70",
  perfumeLuxury:
    "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=70",
  perfumeVolume:
    "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=70",
  miniTravel:
    "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=900&q=70",
  miniGift:
    "https://images.unsplash.com/photo-1606830733744-0ad778449672?auto=format&fit=crop&w=900&q=70",
  makeupBranded:
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=70",
  makeupMixed:
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=70",
  shoesBranded:
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=70",
  shoesSport:
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=70",
} as const;

export const PALLETS: Pallet[] = [
  {
    id: "pal-perfume-designer",
    name: "Designer Perfume Pallet",
    categoryId: "perfume-full",
    pieces: 60,
    unitPrice: 14.4,
    price: 864,
    brands: ["Dior", "Chanel", "Versace", "Paco Rabanne"],
    condition: "Original sealed retail flacons",
    image: IMG.perfumeDesigner,
  },
  {
    id: "pal-perfume-luxury",
    name: "Luxury & Niche Perfume Pallet",
    categoryId: "perfume-full",
    pieces: 40,
    unitPrice: 22.0,
    price: 880,
    brands: ["Creed", "Tom Ford", "Maison Margiela"],
    condition: "Sealed, traceable luxury stock",
    image: IMG.perfumeLuxury,
  },
  {
    id: "pal-perfume-volume",
    name: "Premium Fragrance Pallet",
    categoryId: "perfume-full",
    pieces: 100,
    unitPrice: 13.5,
    price: 1350,
    brands: ["Dior", "Armani", "Hugo Boss", "Versace"],
    condition: "Mixed full-size, best unit margin",
    image: IMG.perfumeVolume,
  },
  {
    id: "pal-mini-travel",
    name: "Travel & Mini Fragrance Pallet",
    categoryId: "perfume-mini",
    pieces: 80,
    unitPrice: 6.5,
    price: 520,
    brands: ["Versace", "YSL", "Paco Rabanne"],
    condition: "10–30ml minis & travel sprays",
    image: IMG.miniTravel,
  },
  {
    id: "pal-mini-gift",
    name: "Discovery Gift Set Pallet",
    categoryId: "perfume-mini",
    pieces: 60,
    unitPrice: 7.2,
    price: 432,
    brands: ["YSL", "Versace", "Carolina Herrera"],
    condition: "Boxed gifting sets, high sell-through",
    image: IMG.miniGift,
  },
  {
    id: "pal-makeup-branded",
    name: "Branded Cosmetics Pallet",
    categoryId: "makeup",
    pieces: 60,
    unitPrice: 9.5,
    price: 570,
    brands: ["MAC", "NARS", "Charlotte Tilbury"],
    condition: "Sealed colour & complexion lines",
    image: IMG.makeupBranded,
  },
  {
    id: "pal-makeup-mixed",
    name: "Mixed Makeup Pallet",
    categoryId: "makeup",
    pieces: 100,
    unitPrice: 8.2,
    price: 820,
    brands: ["Maybelline", "L'Oréal", "Revlon", "MAC"],
    condition: "High-street & premium mix",
    image: IMG.makeupMixed,
  },
  {
    id: "pal-shoes-branded",
    name: "Branded Footwear Pallet",
    categoryId: "shoes",
    pieces: 40,
    unitPrice: 32.0,
    price: 1280,
    brands: ["Nike", "Adidas", "Puma"],
    condition: "Boxed, mixed sizes",
    image: IMG.shoesBranded,
  },
  {
    id: "pal-shoes-sport",
    name: "Sport & Lifestyle Trainer Pallet",
    categoryId: "shoes",
    pieces: 60,
    unitPrice: 28.0,
    price: 1680,
    brands: ["Nike", "Adidas", "New Balance"],
    condition: "Lifestyle silhouettes, mixed sizes",
    image: IMG.shoesSport,
  },
];

export const getPallet = (id: string) => PALLETS.find((p) => p.id === id);

export const getPalletsByCategory = (categoryId: CategoryId) =>
  PALLETS.filter((p) => p.categoryId === categoryId);
