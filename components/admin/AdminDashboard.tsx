"use client";

import { useState } from "react";
import { ClipboardList, LayoutGrid } from "lucide-react";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { PalletsManager } from "@/components/admin/PalletsManager";
import { cn } from "@/lib/cn";
import type { AdminOrder, Category, Pallet } from "@/lib/types";

type Tab = "orders" | "catalogue";

const TABS: Array<{ id: Tab; label: string; icon: typeof ClipboardList }> = [
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "catalogue", label: "Pallets & Categories", icon: LayoutGrid },
];

export function AdminDashboard({
  orders,
  pallets,
  categories,
}: {
  orders: AdminOrder[];
  pallets: Pallet[];
  categories: Category[];
}) {
  const [tab, setTab] = useState<Tab>("orders");

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {tab === "orders" ? "Wholesale orders" : "Catalogue management"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {tab === "orders"
            ? "Review incoming pallet orders, client details and fulfilment status."
            : "Upload and edit storefront pallets, price brackets and categories."}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border border-slate-200 bg-white p-1 sm:inline-flex">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors sm:flex-none sm:px-4",
              tab === id ? "bg-red-600 text-white" : "text-slate-600 hover:text-slate-900",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "orders" ? (
        <OrdersTable allOrders={orders} />
      ) : (
        <PalletsManager initialPallets={pallets} initialCategories={categories} />
      )}
    </div>
  );
}
