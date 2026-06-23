"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import { uploadPalletImage } from "@/app/admin/(dashboard)/actions";

const inputCls =
  "w-full border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/avif";

/**
 * Pallet image manager: pick MULTIPLE files at once (up to `max` total),
 * uploaded to storage in parallel, plus drag & drop, paste-a-URL, reorder
 * (set cover) and remove. The first image is the cover.
 */
export function PalletImagesField({
  images,
  onChange,
  max = 4,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
}) {
  const pics = images.filter(Boolean);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState("");

  const remaining = max - pics.length;

  async function handleFiles(list: FileList | File[] | null | undefined) {
    if (!list) return;
    const files = Array.from(list);
    if (files.length === 0) return;
    if (remaining <= 0) {
      setError(`You can add up to ${max} images.`);
      return;
    }

    const take = files.slice(0, remaining);
    const skipped = files.length - take.length;

    setUploading(true);
    setError(null);
    const results = await Promise.all(
      take.map((f) => {
        const fd = new FormData();
        fd.append("file", f);
        return uploadPalletImage(fd);
      }),
    );
    setUploading(false);

    const urls = results.filter((r) => r.ok && r.url).map((r) => r.url as string);
    const failed = results.length - urls.length;
    if (urls.length) onChange([...pics, ...urls].slice(0, max));

    const msgs = [];
    if (failed) msgs.push(`${failed} image${failed > 1 ? "s" : ""} failed to upload.`);
    if (skipped) msgs.push(`Only ${max} images allowed, ${skipped} skipped.`);
    setError(msgs.length ? msgs.join(" ") : null);
  }

  function addUrl() {
    const u = url.trim();
    if (!u) return;
    if (remaining <= 0) {
      setError(`You can add up to ${max} images.`);
      return;
    }
    onChange([...pics, u].slice(0, max));
    setUrl("");
    setError(null);
  }

  function removeAt(i: number) {
    onChange(pics.filter((_, idx) => idx !== i));
    setError(null);
  }

  function makeCover(i: number) {
    const next = [...pics];
    const [moved] = next.splice(i, 1);
    next.unshift(moved);
    onChange(next);
  }

  return (
    <div>
      {/* Current images */}
      {pics.length > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {pics.map((src, i) => (
            <div key={i} className="group relative aspect-square border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-0 top-0 bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-slate-900/70 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => makeCover(i)}
                    title="Make cover"
                    className="flex h-6 w-6 items-center justify-center bg-white/90 text-slate-700 hover:bg-white"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  title="Remove"
                  className="flex h-6 w-6 items-center justify-center bg-white/90 text-slate-700 hover:bg-white hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Multi-file dropzone */}
      {remaining > 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`flex flex-col items-center justify-center border border-dashed px-4 py-6 text-center transition-colors ${
            dragging ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-red-500" />
              <p className="mt-1.5 text-xs font-medium text-slate-700">Uploading…</p>
            </>
          ) : (
            <>
              <UploadCloud className="h-6 w-6 text-slate-400" />
              <p className="mt-1.5 text-xs font-medium text-slate-700">
                Drag &amp; drop up to {remaining} image{remaining > 1 ? "s" : ""}
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-2 inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-400"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                Choose multiple from computer
              </button>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      ) : (
        <p className="border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Maximum of {max} images reached.
        </p>
      )}

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}

      {/* Paste a URL */}
      {remaining > 0 && (
        <div className="mt-2 flex gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            className={inputCls}
            placeholder="…or paste an image URL"
          />
          <button
            type="button"
            onClick={addUrl}
            className="shrink-0 border border-slate-300 px-3 text-sm font-medium text-slate-700 transition-colors hover:border-red-400 hover:text-red-600"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
