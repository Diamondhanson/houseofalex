import { cn } from "@/lib/cn";
import type { OrderStatus } from "@/lib/types";

const STYLES: Record<OrderStatus, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  invoiced: { label: "Invoiced", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  dispatched: { label: "Dispatched", cls: "bg-slate-100 text-slate-700 ring-slate-300" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700 ring-red-200" },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, cls } = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        cls,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
