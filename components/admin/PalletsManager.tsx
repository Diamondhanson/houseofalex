"use client";

import { useState } from "react";
import { ImageIcon, Layers, Pencil, Plus, Tag, Trash2, UploadCloud } from "lucide-react";
import { CATEGORIES, PALLET_TIERS } from "@/lib/data/catalog";
import { PALLETS } from "@/lib/data/pallets";
import { formatGBP } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { SideSheet } from "@/components/admin/SideSheet";
import { cn } from "@/lib/cn";
import type { CategoryId } from "@/lib/types";

// Admin-side pallet record = storefront Pallet + a publish flag.
interface PalletDraft {
  id: string;
  name: string;
  categoryId: CategoryId;
  pieces: number;
  unitPrice: number;
  brands: string; // comma-separated in the form
  condition: string;
  image: string;
  active: boolean;
}

const seed: PalletDraft[] = PALLETS.map((p) => ({
  id: p.id,
  name: p.name,
  categoryId: p.categoryId,
  pieces: p.pieces,
  unitPrice: p.unitPrice,
  brands: p.brands.join(", "),
  condition: p.condition,
  image: p.image,
  active: true,
}));

const blank = (): PalletDraft => ({
  id: "",
  name: "",
  categoryId: CATEGORIES[0].id,
  pieces: 60,
  unitPrice: 14.4,
  brands: "",
  condition: "",
  image: "",
  active: true,
});

const labelFor = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id;
const totalPrice = (d: PalletDraft) => Math.round(d.pieces * d.unitPrice * 100) / 100;

export function PalletsManager() {
  const [pallets, setPallets] = useState<PalletDraft[]>(seed);
  const [categories, setCategories] = useState(CATEGORIES);
  const [brackets, setBrackets] = useState(PALLET_TIERS.map((t) => ({ ...t })));

  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<PalletDraft>(blank());
  const [editingId, setEditingId] = useState<string | null>(null);

  function openAdd() {
    setDraft(blank());
    setEditingId(null);
    setSheetOpen(true);
  }

  function openEdit(p: PalletDraft) {
    setDraft({ ...p });
    setEditingId(p.id);
    setSheetOpen(true);
  }

  function save() {
    if (!draft.name.trim()) return;
    // TODO(supabase): upsert into `pallets`; upload image to Storage / Blob.
    if (editingId) {
      setPallets((prev) => prev.map((p) => (p.id === editingId ? { ...draft, id: editingId } : p)));
      console.log("[admin] pallet updated:", { ...draft, id: editingId, price: totalPrice(draft) });
    } else {
      const id = `pal-${Date.now()}`;
      const created = { ...draft, id };
      setPallets((prev) => [created, ...prev]);
      console.log("[admin] pallet uploaded:", { ...created, price: totalPrice(created) });
    }
    setSheetOpen(false);
  }

  function remove(id: string) {
    setPallets((prev) => prev.filter((p) => p.id !== id));
    console.log("[admin] pallet removed:", id);
  }

  function toggle(id: string) {
    setPallets((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  }

  function deleteCategory(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    console.log("[admin] category removed:", id);
  }

  function updateBracket(id: string, unitPrice: number) {
    setBrackets((prev) => prev.map((b) => (b.id === id ? { ...b, unitPrice } : b)));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      {/* Pallets table */}
      <section className="border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-700">
              <Layers className="h-4 w-4 text-red-600" />
              Storefront Pallets
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {pallets.length} pallets · {pallets.filter((p) => p.active).length} live
            </p>
          </div>
          <Button size="sm" onClick={openAdd}>
            <UploadCloud className="h-4 w-4" />
            Upload New Pallet
          </Button>
        </div>

        <div className="max-h-[34rem] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-medium">Pallet</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 text-right font-medium">Units</th>
                <th className="px-5 py-3 text-right font-medium">Unit £</th>
                <th className="px-5 py-3 text-right font-medium">Pallet £</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {pallets.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          className="h-11 w-11 shrink-0 border border-slate-200 object-cover"
                        />
                      ) : (
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 text-slate-400">
                          <ImageIcon className="h-4 w-4" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900">{p.name || "Untitled"}</div>
                        <div className="truncate text-xs text-slate-500">{p.brands || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{labelFor(p.categoryId)}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-slate-700">{p.pieces}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                    {formatGBP(p.unitPrice)}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums text-slate-900">
                    {formatGBP(totalPrice(p))}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => toggle(p.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition-colors",
                        p.active
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-slate-100 text-slate-500 ring-slate-300",
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {p.active ? "Live" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="flex h-8 w-8 items-center justify-center border border-slate-300 text-slate-500 transition-colors hover:border-red-400 hover:text-red-600"
                        aria-label={`Edit ${p.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        className="flex h-8 w-8 items-center justify-center border border-slate-300 text-slate-500 transition-colors hover:border-red-400 hover:text-red-600"
                        aria-label={`Delete ${p.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pallets.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">
                    No pallets. Use “Upload New Pallet” to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Right column: price brackets + categories */}
      <div className="space-y-6">
        <section className="border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-700">
            <Layers className="h-4 w-4 text-red-600" />
            Bulk Price Brackets
          </h2>
          <div className="mt-4 space-y-3">
            {brackets.map((b) => (
              <div key={b.id} className="border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">{b.quantity} pcs</span>
                  <span className="text-xs text-slate-500">{b.name}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-slate-500">£</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={b.unitPrice}
                    onChange={(e) => updateBracket(b.id, Number(e.target.value))}
                    className="w-full border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <span className="whitespace-nowrap text-xs text-slate-500">/ unit</span>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4 w-full"
            onClick={() => console.log("[admin] price brackets saved:", brackets)}
          >
            Save brackets
          </Button>
        </section>

        <section className="border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-700">
            <Tag className="h-4 w-4 text-red-600" />
            Categories
          </h2>
          <ul className="mt-4 space-y-2">
            {categories.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between border border-slate-200 bg-slate-50 px-3 py-2.5"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">{c.label}</div>
                  <div className="text-[11px] text-slate-500">
                    {pallets.filter((p) => p.categoryId === c.id).length} pallets
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteCategory(c.id)}
                  className="flex h-8 w-8 items-center justify-center border border-slate-300 text-slate-500 transition-colors hover:border-red-400 hover:text-red-600"
                  aria-label={`Delete ${c.label}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
            {categories.length === 0 && (
              <li className="py-4 text-center text-xs text-slate-500">All categories removed.</li>
            )}
          </ul>
        </section>
      </div>

      {/* Upload / Edit Pallet side sheet */}
      <SideSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editingId ? "Edit pallet" : "Upload new pallet"}
        description={
          editingId
            ? "Update this storefront pallet."
            : "Add a new pallet to the storefront catalogue."
        }
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={save}>
              {editingId ? "Save changes" : "Publish pallet"}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Image: live preview from URL + upload placeholder */}
          <SheetField label="Pallet image">
            {draft.image ? (
              <div className="relative border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={draft.image}
                  alt="Pallet preview"
                  className="aspect-[4/3] w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, image: "" })}
                  className="absolute right-2 top-2 bg-white/90 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-white"
                >
                  Replace
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
                <UploadCloud className="h-7 w-7 text-slate-400" />
                <p className="mt-2 text-sm font-medium text-slate-700">Drag & drop (mock)</p>
                <p className="text-xs text-slate-500">or paste an image URL below</p>
              </div>
            )}
            <input
              value={draft.image}
              onChange={(e) => setDraft({ ...draft, image: e.target.value })}
              className={`${inputCls} mt-2`}
              placeholder="https://…/pallet.jpg"
            />
          </SheetField>

          <SheetField label="Pallet name" required>
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className={inputCls}
              placeholder="e.g. Designer Perfume Pallet"
            />
          </SheetField>

          <SheetField label="Category">
            <select
              value={draft.categoryId}
              onChange={(e) => setDraft({ ...draft, categoryId: e.target.value as CategoryId })}
              className={inputCls}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </SheetField>

          <div className="grid grid-cols-2 gap-4">
            <SheetField label="Units per pallet">
              <input
                type="number"
                min="1"
                value={draft.pieces}
                onChange={(e) => setDraft({ ...draft, pieces: Number(e.target.value) })}
                className={inputCls}
              />
            </SheetField>
            <SheetField label="Unit price (£)">
              <input
                type="number"
                step="0.01"
                min="0"
                value={draft.unitPrice}
                onChange={(e) => setDraft({ ...draft, unitPrice: Number(e.target.value) })}
                className={inputCls}
              />
            </SheetField>
          </div>

          {/* Derived total */}
          <div className="flex items-center justify-between border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <span className="text-slate-500">Pallet total (auto)</span>
            <span className="font-bold text-slate-900">{formatGBP(totalPrice(draft))}</span>
          </div>

          <SheetField label="Brands (comma-separated)">
            <input
              value={draft.brands}
              onChange={(e) => setDraft({ ...draft, brands: e.target.value })}
              className={inputCls}
              placeholder="Dior, Chanel, Versace"
            />
          </SheetField>

          <SheetField label="Condition / contents note">
            <input
              value={draft.condition}
              onChange={(e) => setDraft({ ...draft, condition: e.target.value })}
              className={inputCls}
              placeholder="Original sealed retail flacons"
            />
          </SheetField>

          <label className="flex items-center gap-3 border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
              className="h-4 w-4 accent-red-600"
            />
            <span className="text-sm text-slate-700">Publish to storefront immediately</span>
          </label>
        </div>
      </SideSheet>
    </div>
  );
}

const inputCls =
  "w-full border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500";

function SheetField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </span>
      {children}
    </label>
  );
}
