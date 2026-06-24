"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, UploadCloud } from "lucide-react";
import { uploadPalletImage } from "@/app/admin/(dashboard)/actions";

const inputCls =
  "w-full border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500";

/**
 * One image field: drag & drop or pick a file from the computer (uploaded to
 * Supabase Storage), with an optional paste-a-URL fallback. Calls onChange with
 * the resolved public URL.
 */
export function ImageInput({
  value,
  onChange,
  aspect = "aspect-[4/3]",
}: {
  value: string;
  onChange: (url: string) => void;
  aspect?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadPalletImage(fd);
    setUploading(false);
    if (!res.ok || !res.url) {
      setError(res.error ?? "Upload failed.");
      return;
    }
    onChange(res.url);
  }

  return (
    <div>
      {value ? (
        <div className={`relative border border-slate-200 ${aspect} w-full`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 bg-white/90 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-white"
          >
            Replace
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
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
              <p className="mt-1.5 text-xs font-medium text-slate-700">Add an image</p>
              <p className="mt-0.5 hidden text-[11px] text-slate-400 sm:block">
                Drag &amp; drop, or use the button below
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-2 inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-400"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                Choose or take photo
              </button>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}

      {!value && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} mt-2`}
          placeholder="…or paste an image URL"
        />
      )}
    </div>
  );
}
