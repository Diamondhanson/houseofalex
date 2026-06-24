"use client";

import { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatGBP, formatDate } from "@/lib/format";
import type { AdminOrder, OrderStatus } from "@/lib/types";
import { SideSheet } from "@/components/admin/SideSheet";
import { cn } from "@/lib/cn";

const FILTERS: Array<{ id: OrderStatus | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "invoiced", label: "Invoiced" },
  { id: "paid", label: "Paid" },
  { id: "dispatched", label: "Dispatched" },
  { id: "cancelled", label: "Cancelled" },
];

export function OrdersTable({ allOrders }: { allOrders: AdminOrder[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [selected, setSelected] = useState<AdminOrder | null>(null);

  const orders = useMemo(() => {
    return allOrders.filter((o) => {
      const matchesFilter = filter === "all" || o.status === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        o.company.toLowerCase().includes(q) ||
        o.reference.toLowerCase().includes(q) ||
        o.contactName.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [query, filter, allOrders]);

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      {/* Summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Orders shown" value={String(orders.length)} />
        <SummaryCard
          label="Pieces committed"
          value={orders
            .filter((o) => o.status !== "cancelled")
            .reduce((s, o) => s + o.pieces, 0)
            .toLocaleString("en-GB")}
        />
        <SummaryCard label="Active order value" value={formatGBP(revenue)} accent />
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "border px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f.id
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:border-slate-400",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company, ref, contact…"
            className="w-full border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:w-72"
          />
        </div>
      </div>

      {/* Mobile: card list (the table is too wide for phones) */}
      <ul className="divide-y divide-slate-200 border border-slate-200 bg-white md:hidden">
        {orders.map((o) => (
          <li key={o.reference}>
            <button
              type="button"
              onClick={() => setSelected(o)}
              className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-red-600">
                    {o.reference}
                  </span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="mt-1.5 truncate text-sm font-medium text-slate-900">
                  {o.company}
                </div>
                <div className="truncate text-xs text-slate-500">{o.contactName}</div>
                <div className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-600">
                  <span className="truncate">{o.tierName}</span>
                  <span className="shrink-0 tabular-nums">
                    {o.pieces} pcs
                    <span className="mx-1.5 text-slate-300">·</span>
                    <span className="font-semibold text-slate-900">{formatGBP(o.total)}</span>
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-400">{formatDate(o.placedAt)}</div>
              </div>
              <Eye className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          </li>
        ))}
        {orders.length === 0 && (
          <li className="px-5 py-12 text-center text-sm text-slate-500">
            No orders match your filters.
          </li>
        )}
      </ul>

      {/* Desktop: full table */}
      <div className="hidden border border-slate-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5 font-medium">Reference</th>
                <th className="px-5 py-3.5 font-medium">Client</th>
                <th className="px-5 py-3.5 font-medium">Pallet</th>
                <th className="px-5 py-3.5 text-right font-medium">Pieces</th>
                <th className="px-5 py-3.5 text-right font-medium">Total</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Placed</th>
                <th className="px-5 py-3.5 text-right font-medium">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orders.map((o) => (
                <tr key={o.reference} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-red-600">
                    {o.reference}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-900">{o.company}</div>
                    <div className="text-xs text-slate-500">{o.contactName}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{o.tierName}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-slate-700">{o.pieces}</td>
                  <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-slate-900">
                    {formatGBP(o.total)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{formatDate(o.placedAt)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(o)}
                      className="inline-flex h-8 w-8 items-center justify-center border border-slate-300 text-slate-500 transition-colors hover:border-red-400 hover:text-red-600"
                      aria-label={`View ${o.reference}`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">
                    No orders match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail side sheet */}
      <SideSheet
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? selected.reference : "Order"}
        description={selected?.company}
      >
        {selected && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <StatusBadge status={selected.status} />
              <span className="text-sm text-slate-500">{formatDate(selected.placedAt)}</span>
            </div>
            <dl className="space-y-3 text-sm">
              <Detail label="Contact" value={selected.contactName} />
              <Detail label="Pallet tier" value={selected.tierName} />
              <Detail label="Pieces" value={String(selected.pieces)} />
              <Detail label="Order value" value={formatGBP(selected.total)} accent />
            </dl>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pallet breakdown
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {selected.breakdown.map((b) => (
                  <span
                    key={b}
                    className="border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </SideSheet>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="border border-slate-200 bg-white p-5">
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div
        className={cn(
          "mt-1.5 text-2xl font-bold tabular-nums",
          accent ? "text-red-600" : "text-slate-900",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className={cn("font-semibold", accent ? "text-red-600" : "text-slate-900")}>{value}</dd>
    </div>
  );
}
