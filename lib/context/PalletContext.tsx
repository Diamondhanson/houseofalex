"use client";

// Simple e-commerce cart of bulk pallets. Stores a full snapshot of each pallet
// (not just an id) so it works regardless of where the catalogue comes from -
// the static seed or Supabase-uploaded pallets. Self-contained (React context +
// useReducer) for instant reactivity.

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { Pallet } from "@/lib/types";

interface Line {
  pallet: Pallet;
  qty: number;
}
type Items = Record<string, Line>; // palletId -> line

interface CartState {
  items: Items;
}

type Action =
  | { type: "ADD"; pallet: Pallet }
  | { type: "REMOVE"; palletId: string }
  | { type: "SET_QTY"; pallet: Pallet; qty: number }
  | { type: "CLEAR" };

const initialState: CartState = { items: {} };

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "ADD": {
      const id = action.pallet.id;
      const qty = (state.items[id]?.qty ?? 0) + 1;
      return { items: { ...state.items, [id]: { pallet: action.pallet, qty } } };
    }
    case "REMOVE": {
      const current = state.items[action.palletId]?.qty ?? 0;
      if (current <= 0) return state;
      const items = { ...state.items };
      if (current - 1 === 0) delete items[action.palletId];
      else items[action.palletId] = { ...items[action.palletId], qty: current - 1 };
      return { items };
    }
    case "SET_QTY": {
      const id = action.pallet.id;
      const qty = Math.max(0, Math.floor(action.qty));
      const items = { ...state.items };
      if (qty === 0) delete items[id];
      else items[id] = { pallet: action.pallet, qty };
      return { items };
    }
    case "CLEAR":
      return { items: {} };
    default:
      return state;
  }
}

interface CartContextValue {
  items: Items;
  lines: Line[];
  totalPallets: number;
  totalUnits: number;
  totalCost: number;
  qtyOf: (palletId: string) => number;
  add: (pallet: Pallet) => void;
  remove: (palletId: string) => void;
  setQty: (pallet: Pallet, qty: number) => void;
  clear: () => void;
  /** Minimal item list to send to the server for recompute + persistence. */
  orderItems: () => Array<{ palletId: string; quantity: number }>;
}

const PalletContext = createContext<CartContextValue | null>(null);

export function PalletProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo<CartContextValue>(() => {
    const lines = Object.values(state.items);
    let totalPallets = 0;
    let totalUnits = 0;
    let totalCost = 0;
    for (const { pallet, qty } of lines) {
      totalPallets += qty;
      totalUnits += qty * pallet.pieces;
      totalCost += qty * pallet.price;
    }

    return {
      items: state.items,
      lines,
      totalPallets,
      totalUnits,
      totalCost,
      qtyOf: (palletId) => state.items[palletId]?.qty ?? 0,
      add: (pallet) => dispatch({ type: "ADD", pallet }),
      remove: (palletId) => dispatch({ type: "REMOVE", palletId }),
      setQty: (pallet, qty) => dispatch({ type: "SET_QTY", pallet, qty }),
      clear: () => dispatch({ type: "CLEAR" }),
      orderItems: () =>
        lines.map(({ pallet, qty }) => ({ palletId: pallet.id, quantity: qty })),
    };
  }, [state]);

  return <PalletContext.Provider value={value}>{children}</PalletContext.Provider>;
}

export function usePallet() {
  const ctx = useContext(PalletContext);
  if (!ctx) throw new Error("usePallet must be used within a PalletProvider");
  return ctx;
}
