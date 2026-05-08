import Link from "next/link";

import { ImagePlaceholder } from "@/components/image-placeholder";
import { buttonClassName } from "@/components/ui/button";
import { type CatalogueProduct } from "@/lib/catalog/types";

type ProductEditorialCardProps = {
  product: CatalogueProduct;
};

function joinLabels(values: string[], fallback = "Available on request") {
  return values.filter(Boolean).join(", ") || fallback;
}

export function ProductEditorialCard({ product }: ProductEditorialCardProps) {
  const packSizes = joinLabels(product.packFormats.map((format) => format.label));
  const bestFor = joinLabels(product.bestFor.slice(0, 2));
  const ingredients = joinLabels(product.ingredients);
  const allergens = joinLabels(product.allergens);

  const infoRows = [
    { label: "Size", value: packSizes },
    { label: "Best for", value: bestFor },
    { label: "Ingredients", value: ingredients },
    { label: "Allergens", value: allergens },
  ];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.45rem] border border-white/10 bg-[color:var(--brand-2)] text-white shadow-[0_22px_44px_rgba(46,18,69,0.24)]">
      <Link href={`/products/${product.slug}`} className="block">
        <ImagePlaceholder
          src={product.imageUrl}
          alt={`${product.name} product image`}
          label="Product Image"
          decorated={false}
          className="product-card-media aspect-[2/3] bg-[color:var(--brand-2)]"
          sizes="(max-width: 640px) 92vw, (max-width: 1280px) 45vw, 24vw"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="space-y-3">
          <span className="inline-flex rounded-full border border-white/14 bg-white/12 px-3 py-1 text-[0.66rem] font-black uppercase tracking-[0.18em] text-[color:var(--brand-3)]">
            {product.category}
          </span>
          <h3 className="display-heading text-[1.7rem] text-white sm:text-[1.95rem]">
            {product.name}
          </h3>
          <p className="pretty-text line-clamp-3 text-sm leading-7 text-white/72">
            {product.shortDescription}
          </p>
        </div>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {infoRows.map((row, index) => (
            <div
              key={row.label}
              className={
                index % 2 === 0
                  ? "grid gap-1 px-3 py-2.5"
                  : "grid gap-1 bg-white/[0.055] px-3 py-2.5"
              }
            >
              <span className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-white/44">
                {row.label}
              </span>
              <span className="line-clamp-2 text-xs leading-5 text-white/78">{row.value}</span>
            </div>
          ))}
        </div>

        <Link
          href={`/products/${product.slug}`}
          className={buttonClassName({
            variant: "primary",
            size: "md",
            className: "mt-auto w-full touch-manipulation",
          })}
        >
          View Product
        </Link>
      </div>
    </article>
  );
}
