// Shared domain types for the House of Alex wholesale portal.
// Kept framework-agnostic so a Supabase data layer can map onto these directly.

export type CategoryId = "perfume-full" | "perfume-mini" | "makeup" | "shoes";

export interface Category {
  id: CategoryId;
  /** Customer-facing label, e.g. "Full-Size Perfumes" */
  label: string;
  /** Short marketing blurb used on the homepage taster cards */
  tagline: string;
  /** Stock image URL for the category card. */
  image: string;
}

/** A ready-to-ship bulk pallet - the product listed on the storefront. */
export interface Pallet {
  id: string;
  name: string;
  categoryId: CategoryId;
  /** Units in the pallet. */
  pieces: number;
  /** Effective per-unit price (£). */
  unitPrice: number;
  /** Total pallet price (£). */
  price: number;
  /** Representative brands included in the mix. */
  brands: string[];
  /** Short condition / contents note. */
  condition: string;
  /** Primary/cover image. */
  image: string;
  /** All images for the pallet (1–4). Cover is images[0]. */
  images?: string[];
  /** Whether the pallet is published to the storefront (admin view). */
  active?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  categoryId: CategoryId;
}

export interface Product {
  id: string;
  name: string;
  brandId: string;
  categoryId: CategoryId;
  /** Indicative retail RRP per unit (£). Used for the "savings" framing only. */
  rrp: number;
}

/** A fixed-volume pallet tier. The unit price is what the buyer actually pays. */
export interface PalletTier {
  id: string;
  name: string;
  /** Exact number of pieces the buyer must select to fulfil the pallet. */
  quantity: number;
  /** Per-unit price (£) once this tier is selected. */
  unitPrice: number;
  /** Short note shown on the tier card. */
  note: string;
}

/** Cart contents: palletId -> quantity of that pallet. */
export type CartItems = Record<string, number>;

/** The full payload handed to handlePlaceOrder() / a future Resend hook. */
export interface OrderPayload {
  reference: string;
  lines: Array<{
    palletId: string;
    name: string;
    categoryLabel: string;
    pieces: number;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
  totalPallets: number;
  totalUnits: number;
  totalCost: number;
  business: BusinessDetails;
  submittedAt: string;
}

export interface BusinessDetails {
  company: string;
  contactName: string;
  email: string;
  phone: string;
  vatNumber: string;
  addressLine1: string;
  city: string;
  postcode: string;
  country: string;
  notes: string;
}

export type OrderStatus =
  | "pending"
  | "invoiced"
  | "paid"
  | "dispatched"
  | "cancelled";

/** Dummy order record rendered in the admin orders table. */
export interface AdminOrder {
  reference: string;
  company: string;
  contactName: string;
  tierName: string;
  pieces: number;
  total: number;
  status: OrderStatus;
  placedAt: string;
  breakdown: string[];
}
