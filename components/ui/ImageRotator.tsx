"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Cross-fades through a set of images, ease-in-out, on a fixed interval.
 * The container sizes itself (pass an aspect/height via className); images are
 * absolutely stacked and fade between each other.
 */
export function ImageRotator({
  images,
  alt,
  className,
  interval = 3000,
  eager = false,
}: {
  images: string[];
  alt: string;
  className?: string;
  interval?: number;
  eager?: boolean;
}) {
  const pics = images.filter(Boolean);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (pics.length <= 1) return;
    const id = setInterval(() => setActive((p) => (p + 1) % pics.length), interval);
    return () => clearInterval(id);
  }, [pics.length, interval]);

  if (pics.length === 0) return null;

  return (
    <div className={cn("relative overflow-hidden bg-slate-100", className)}>
      {pics.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out",
            i === active ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </div>
  );
}
