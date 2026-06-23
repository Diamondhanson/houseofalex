"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Layers, Pencil, Plus, Tag, Trash2, UploadCloud } from "lucide-react";
import { PALLET_TIERS, prettifyCategoryId } from "@/lib/data/catalog";
import { formatGBP } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { SideSheet } from "@/components/admin/SideSheet";
import { ImageInput } from "@/components/admin/ImageInput";
import { PalletImagesField } from "@/components/admin/PalletImagesField";
import { cn } from "@/lib/cn";
import type { Category, Pallet } from "@/lib/types";
import {
  createPallet,
  updatePallet,
  deletePallet,
  setPalletActive,
  createCategory,
  updateCategory,
  deleteCategory as deleteCategoryAction,
  type PalletInput,
  type CategoryInput,
} from "@/app/admin/(dashboard)/actions";

// Each pallet (offer) can carry up to 4 images.
const MAX_IMAGES = 4;

// Admin-side pallet record = storefront Pallet + a publish flag.
interface PalletDraft {
  id: string;
  name: string;
  categoryId: string;
  pieces: number;
  unitPrice: number;
  brands: string; // comma-separated in the form
  condition: string;
  images: string[]; // 1..MAX_IMAGES
  active: boolean;
}

interface CategoryDraft {
  id: string | null; // null = creating
  label: string;
  tagline: string;
  image: string;
}

const toDraft = (p: Pallet): PalletDraft => ({
  id: p.id,
  name: p.name,
  categoryId: p.categoryId,
  pieces: p.pieces,
  unitPrice: p.unitPrice,
  brands: p.brands.join(", "),
  condition: p.condition,
  images: p.images && p.images.length ? p.images : [p.image].filter(Boolean),
  active: p.active ?? true,
});

const blank = (categoryId: string): PalletDraft => ({
  id: "",
  name: "",
  categoryId,
  pieces: 60,
  unitPrice: 14.4,
  brands: "",
  condition: "",
  images: [""],
  active: true,
});

const totalPrice = (d: PalletDraft) => Math.round(d.pieces * d.unitPrice * 100) / 100;
const coverImage = (d: PalletDraft) => d.images.find((src) => src) ?? "";
const imageCount = (d: PalletDraft) => d.images.filter((src) => src).length;

const toInput = (d: PalletDraft): PalletInput => ({
  name: d.name,
  categoryId: d.categoryId,
  pieces: d.pieces,
  unitPrice: d.unitPrice,
  price: totalPrice(d),
  brands: d.brands.split(",").map((b) => b.trim()).filter(Boolean),
  condition: d.condition,
  images: d.images.filter((s) => s.trim()),
  active: d.active,
});

export function PalletsManager({
  initialPallets,
  initialCategories,
}: {
  initialPallets: Pallet[];
  initialCategories: Category[];
}) {
  const router = useRouter();
  const [pallets, setPallets] = useState<PalletDraft[]>(initialPallets.map(toDraft));
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [brackets, setBrackets] = useState(PALLET_TIERS.map((t) => ({ ...t })));

  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<PalletDraft>(blank(""));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);

  // Category editor (shared by the Categories panel + the "New" button in the form).
  const [catSheetOpen, setCatSheetOpen] = useState(false);
  const [catDraft, setCatDraft] = useState<CategoryDraft>({
    id: null,
    label: "",
    tagline: "",
    image: "",
  });
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);
  // When a category is created from inside the pallet form, auto-select it.
  const [selectAfterCreate, setSelectAfterCreate] = useState(false);

  const labelFor = (id: string) =>
    categories.find((c) => c.id === id)?.label || prettifyCategoryId(id) || "Uncategorised";

  function openAdd() {
    setDraft(blank(categories[0]?.id ?? ""));
    setEditingId(null);
    setSheetError(null);
    setSheetOpen(true);
  }

  function openEdit(p: PalletDraft) {
    setDraft({ ...p, images: [...p.images] });
    setEditingId(p.id);
    setSheetError(null);
    setSheetOpen(true);
  }

  async function save() {
    if (!draft.name.trim()) {
      setSheetError("Pallet name is required.");
      return;
    }
    if (!draft.categoryId) {
      setSheetError("Pick or create a category first.");
      return;
    }
    setSaving(true);
    setSheetError(null);
    const input = toInput(draft);
    const result = editingId
      ? await updatePallet(editingId, input)
      : await createPallet(input);
    setSaving(false);

    if (!result.ok) {
      setSheetError(result.error ?? "Could not save the pallet.");
      return;
    }

    const saved: PalletDraft = {
      ...draft,
      id: result.id ?? editingId ?? draft.id,
      images: input.images.length ? input.images : [""],
    };
    setPallets((prev) =>
      editingId ? prev.map((p) => (p.id === editingId ? saved : p)) : [saved, ...prev],
    );
    setSheetOpen(false);
    router.refresh();
  }

  async function remove(id: string) {
    const prev = pallets;
    setPallets((p) => p.filter((x) => x.id !== id)); // optimistic
    const result = await deletePallet(id);
    if (!result.ok) {
      setPallets(prev); // rollback
      return;
    }
    router.refresh();
  }

  async function toggle(id: string) {
    const target = pallets.find((p) => p.id === id);
    if (!target) return;
    const next = !target.active;
    setPallets((prev) => prev.map((p) => (p.id === id ? { ...p, active: next } : p))); // optimistic
    const result = await setPalletActive(id, next);
    if (!result.ok) {
      setPallets((prev) => prev.map((p) => (p.id === id ? { ...p, active: !next } : p))); // rollback
      return;
    }
    router.refresh();
  }

  // --- category CRUD ---
  function openCategoryAdd(forPallet: boolean) {
    setCatDraft({ id: null, label: "", tagline: "", image: "" });
    setSelectAfterCreate(forPallet);
    setCatError(null);
    setCatSheetOpen(true);
  }
  function openCategoryEdit(c: Category) {
    setCatDraft({ id: c.id, label: c.label, tagline: c.tagline, image: c.image });
    setSelectAfterCreate(false);
    setCatError(null);
    setCatSheetOpen(true);
  }

  async function saveCategory() {
    if (!catDraft.label.trim()) {
      setCatError("Category name is required.");
      return;
    }
    setCatSaving(true);
    setCatError(null);
    const input: CategoryInput = {
      label: catDraft.label,
      tagline: catDraft.tagline,
      image: catDraft.image,
    };
    const result = catDraft.id
      ? await updateCategory(catDraft.id, input)
      : await createCategory(input);
    setCatSaving(false);

    if (!result.ok || !result.id) {
      setCatError(result.error ?? "Could not save the category.");
      return;
    }

    const saved: Category = {
      id: result.id,
      label: catDraft.label.trim(),
      tagline: catDraft.tagline.trim(),
      image: catDraft.image.trim(),
    };
    setCategories((prev) =>
      catDraft.id ? prev.map((c) => (c.id === catDraft.id ? saved : c)) : [...prev, saved],
    );
    if (selectAfterCreate && !catDraft.id) {
      setDraft((d) => ({ ...d, categoryId: saved.id }));
    }
    setCatSheetOpen(false);
    router.refresh();
  }

  async function removeCategory(id: string) {
    const prev = categories;
    setCategories((cs) => cs.filter((c) => c.id !== id)); // optimistic
    const result = await deleteCategoryAction(id);
    if (!result.ok) {
      setCategories(prev); // rollback
      return;
    }
    router.refresh();
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
                      <div className="relative shrink-0">
                        {coverImage(p) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={coverImage(p)}
                            alt={p.name}
                            loading="lazy"
                            className="h-11 w-11 border border-slate-200 object-cover"
                          />
                        ) : (
                          <span className="flex h-11 w-11 items-center justify-center border border-slate-200 bg-slate-50 text-slate-400">
                            <ImageIcon className="h-4 w-4" />
                          </span>
                        )}
                        {imageCount(p) > 1 && (
                          <span
                            className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center gap-0.5 bg-red-600 px-1 text-[10px] font-bold text-white"
                            title={`${imageCount(p)} images`}
                          >
                            <ImageIcon className="h-2.5 w-2.5" />
                            {imageCount(p)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900">{p.name || "Untitled"}</div>
                        <div className="truncate text-xs text-slate-500">{p.brands || "-"}</div>
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
                    onChange={(e) =>
                      setBrackets((prev) =>
                        prev.map((x) =>
                          x.id === b.id ? { ...x, unitPrice: Number(e.target.value) } : x,
                        ),
                      )
                    }
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
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-700">
              <Tag className="h-4 w-4 text-red-600" />
              Categories
            </h2>
            <Button size="sm" variant="secondary" onClick={() => openCategoryAdd(false)}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          <ul className="mt-4 space-y-2">
            {categories.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-2 border border-slate-200 bg-slate-50 px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.image}
                      alt={c.label}
                      loading="lazy"
                      className="h-9 w-9 shrink-0 border border-slate-200 object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-slate-200 bg-white text-slate-400">
                      <Tag className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-900">{c.label}</div>
                    <div className="text-[11px] text-slate-500">
                      {pallets.filter((p) => p.categoryId === c.id).length} pallets
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openCategoryEdit(c)}
                    className="flex h-8 w-8 items-center justify-center border border-slate-300 text-slate-500 transition-colors hover:border-red-400 hover:text-red-600"
                    aria-label={`Edit ${c.label}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCategory(c.id)}
                    className="flex h-8 w-8 items-center justify-center border border-slate-300 text-slate-500 transition-colors hover:border-red-400 hover:text-red-600"
                    aria-label={`Delete ${c.label}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
            {categories.length === 0 && (
              <li className="py-4 text-center text-xs text-slate-500">
                No categories yet. Add one to start listing offers.
              </li>
            )}
          </ul>
        </section>
      </div>

      {/* Upload / Edit Pallet side sheet */}
      <SideSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        widthClass="max-w-xl"
        title={editingId ? "Edit pallet" : "Upload new pallet"}
        description={
          editingId
            ? "Update this storefront pallet."
            : "Add a new pallet to the storefront catalogue."
        }
        footer={
          <div>
            {sheetError && (
              <div className="mb-3 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {sheetError}
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setSheetOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={save} disabled={saving}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Publish pallet"}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Images - select multiple at once, up to MAX_IMAGES per offer */}
          <SheetField label={`Pallet images (${imageCount(draft)}/${MAX_IMAGES})`}>
            <p className="-mt-0.5 mb-2 text-xs text-slate-500">
              Select up to {MAX_IMAGES} images at once. The first is the cover image.
            </p>
            <PalletImagesField
              images={draft.images}
              onChange={(imgs) => setDraft((d) => ({ ...d, images: imgs }))}
              max={MAX_IMAGES}
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
            <div className="flex gap-2">
              <select
                value={draft.categoryId}
                onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
                className={inputCls}
              >
                {categories.length === 0 && <option value="">No categories yet</option>}
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => openCategoryAdd(true)}
                className="inline-flex shrink-0 items-center gap-1.5 border border-slate-300 px-3 text-sm font-medium text-slate-700 transition-colors hover:border-red-400 hover:text-red-600"
                title="Add a new category"
              >
                <Plus className="h-4 w-4" />
                New
              </button>
            </div>
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

      {/* Category editor side sheet (create / edit) */}
      <SideSheet
        open={catSheetOpen}
        onClose={() => setCatSheetOpen(false)}
        title={catDraft.id ? "Edit category" : "New category"}
        description={
          catDraft.id
            ? "Update this category. Changes apply across the storefront."
            : "Create a category for your offers. It appears in the shop filter and homepage."
        }
        footer={
          <div>
            {catError && (
              <div className="mb-3 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {catError}
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setCatSheetOpen(false)}
                disabled={catSaving}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={saveCategory} disabled={catSaving}>
                {catSaving ? "Saving…" : catDraft.id ? "Save changes" : "Create category"}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          <SheetField label="Category name" required>
            <input
              value={catDraft.label}
              onChange={(e) => setCatDraft({ ...catDraft, label: e.target.value })}
              className={inputCls}
              placeholder="e.g. Electronics"
            />
          </SheetField>

          <SheetField label="Tagline">
            <input
              value={catDraft.tagline}
              onChange={(e) => setCatDraft({ ...catDraft, tagline: e.target.value })}
              className={inputCls}
              placeholder="Short blurb shown on the storefront card"
            />
          </SheetField>

          <SheetField label="Category image">
            <ImageInput
              value={catDraft.image}
              onChange={(url) => setCatDraft({ ...catDraft, image: url })}
            />
          </SheetField>
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
