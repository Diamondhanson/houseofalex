"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Product image gallery for the pallet detail page. Swipeable on touch devices,
 * with arrows, thumbnails and a counter when there is more than one image.
 */
export function PalletGallery({
  images,
  alt,
  badge,
}: {
  images: string[];
  alt: string;
  badge?: string;
}) {
  const pics = images.filter(Boolean);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const count = pics.length;
  const active = Math.min(index, Math.max(0, count - 1));

  // Keep index valid if the image list changes.
  useEffect(() => {
    if (index > count - 1) setIndex(0);
  }, [count, index]);

  if (count === 0) {
    return (
      <div className="relative flex aspect-[4/3] w-full items-center justify-center border border-slate-200 bg-slate-100 text-sm text-slate-400">
        No image
      </div>
    );
  }

  // Functional update so rapid clicks/swipes don't read a stale index.
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchStartX.current = null;
  }

  return (
    <div>
      <div
        className="relative select-none overflow-hidden border border-slate-200 bg-slate-100"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Sliding track */}
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {pics.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={`${alt} - image ${i + 1}`}
              draggable={false}
              className="aspect-[4/3] w-full shrink-0 object-cover"
            />
          ))}
        </div>

        {badge && (
          <span className="absolute left-0 top-0 bg-slate-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
            {badge}
          </span>
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/90 text-slate-700 shadow-sm transition-colors hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/90 text-slate-700 shadow-sm transition-colors hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <span className="absolute bottom-2 right-2 bg-slate-900/80 px-2 py-0.5 text-xs font-medium text-white">
              {active + 1} / {count}
            </span>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <div className="mt-3 flex gap-2">
          {pics.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden border transition-colors",
                i === active ? "border-red-600" : "border-slate-200 hover:border-slate-400",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${alt} thumbnail ${i + 1}`}
                draggable={false}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
