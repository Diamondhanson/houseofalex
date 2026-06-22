"use client";

// Simple e-commerce cart of bulk pallets. Self-contained (React context +
// useReducer) for instant reactivity. A future Supabase/persisted-cart layer
// can wrap or replace the reducer without touching consumers.

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { PALLETS, getPallet } from "@/lib/data/pallets";
import { getCategory } from "@/lib/data/catalog";
import type { CartItems, OrderPayload, BusinessDetails } from "@/lib/types";
import { makeOrderReference } from "@/lib/format";

interface CartState {
  items: CartItems; // palletId -> qty
}

type Action =
  | { type: "ADD"; palletId: string }
  | { type: "REMOVE"; palletId: string }
  | { type: "SET_QTY"; palletId: string; qty: number }
  | { type: "CLEAR" };

const initialState: CartState = { items: {} };

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "ADD": {
      const next = (state.items[action.palletId] ?? 0) + 1;
      return { items: { ...state.items, [action.palletId]: next } };
    }
    case "REMOVE": {
      const current = state.items[action.palletId] ?? 0;
      if (current <= 0) return state;
      const items = { ...state.items };
      if (current - 1 === 0) delete items[action.palletId];
      else items[action.palletId] = current - 1;
      return { items };
    }
    case "SET_QTY": {
      const qty = Math.max(0, Math.floor(action.qty));
      const items = { ...state.items };
      if (qty === 0) delete items[action.palletId];
      else items[action.palletId] = qty;
      return { items };
    }
    case "CLEAR":
      return { items: {} };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItems;
  /** Number of distinct pallet selections / total pallet count. */
  totalPallets: number;
  /** Total physical units across all pallets. */
  totalUnits: number;
  totalCost: number;
  qtyOf: (palletId: string) => number;
  add: (palletId: string) => void;
  remove: (palletId: string) => void;
  setQty: (palletId: string, qty: number) => void;
  clear: () => void;
  buildOrderPayload: (business: BusinessDetails) => OrderPayload;
}

const PalletContext = createContext<CartContextValue | null>(null);

export function PalletProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo<CartContextValue>(() => {
    let totalPallets = 0;
    let totalUnits = 0;
    let totalCost = 0;
    for (const [palletId, qty] of Object.entries(state.items)) {
      const pallet = getPallet(palletId);
      totalPallets += qty;
      if (pallet) {
        totalUnits += qty * pallet.pieces;
        totalCost += qty * pallet.price;
      }
    }

    return {
      items: state.items,
      totalPallets,
      totalUnits,
      totalCost,
      qtyOf: (palletId) => state.items[palletId] ?? 0,
      add: (palletId) => dispatch({ type: "ADD", palletId }),
      remove: (palletId) => dispatch({ type: "REMOVE", palletId }),
      setQty: (palletId, qty) => dispatch({ type: "SET_QTY", palletId, qty }),
      clear: () => dispatch({ type: "CLEAR" }),
      buildOrderPayload: (business) => {
        const lines = Object.entries(state.items).map(([palletId, quantity]) => {
          const pallet = getPallet(palletId);
          const category = pallet ? getCategory(pallet.categoryId) : undefined;
          return {
            palletId,
            name: pallet?.name ?? palletId,
            categoryLabel: category?.label ?? "—",
            pieces: pallet?.pieces ?? 0,
            unitPrice: pallet?.price ?? 0,
            quantity,
            lineTotal: (pallet?.price ?? 0) * quantity,
          };
        });
        return {
          reference: makeOrderReference(),
          lines,
          totalPallets,
          totalUnits,
          totalCost,
          business,
          submittedAt: new Date().toISOString(),
        };
      },
    };
  }, [state]);

  return <PalletContext.Provider value={value}>{children}</PalletContext.Provider>;
}

export function usePallet() {
  const ctx = useContext(PalletContext);
  if (!ctx) throw new Error("usePallet must be used within a PalletProvider");
  return ctx;
}

/** Convenience: the full pallet catalogue. */
export const ALL_PALLETS = PALLETS;
