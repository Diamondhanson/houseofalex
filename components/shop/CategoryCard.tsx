import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ImageRotator } from "@/components/ui/ImageRotator";
import { CATEGORY_IMAGES } from "@/lib/data/category-images";
import type { Category } from "@/lib/types";

/** Category tile linking to the shop filtered to that category's offers. */
export function CategoryCard({ category }: { category: Category }) {
  // Prefer the curated local image set; fall back to the single DB image.
  const images = CATEGORY_IMAGES[category.id] ?? (category.image ? [category.image] : []);

  return (
    <Link
      href={`/shop?category=${category.id}`}
      className="group flex flex-col border border-slate-200 bg-white transition-colors hover:border-slate-300"
    >
      {images.length > 0 ? (
        <ImageRotator images={images} alt={category.label} className="aspect-[4/3]" />
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-xl font-bold uppercase tracking-wider text-slate-400">
          {category.label.slice(0, 2)}
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold text-slate-900">{category.label}</h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">{category.tagline}</p>
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-red-600">
          Shop now
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
