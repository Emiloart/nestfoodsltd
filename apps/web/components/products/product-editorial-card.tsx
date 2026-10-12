import Link from "next/link";

import { ProductImage } from "@/components/products/product-image";
import { isProductComingSoon } from "@/lib/catalog/availability";
import { type CatalogueProduct } from "@/lib/catalog/types";

export function ProductEditorialCard({
  product,
  compact = false,
}: {
  product: CatalogueProduct;
  compact?: boolean;
}) {
  const comingSoon = isProductComingSoon(product);
  return (
    <article className="flex h-full flex-col text-neutral-900">
      <Link
        href={`/products/${product.slug}`}
        aria-label={`View ${product.name}`}
        className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--brand-1)]"
      >
        <ProductImage src={product.imageUrl} alt={product.name} />
      </Link>
      <div className="flex flex-1 flex-col items-start gap-3 py-5">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-neutral-700">
          <span>{product.category}</span>
          {comingSoon ? (
            <span className="rounded-full bg-[color:var(--brand-3)] px-3 py-1 text-[color:var(--brand-2)]">
              Coming soon
            </span>
          ) : null}
        </div>
        <h3 className="text-xl font-bold leading-snug">{product.name}</h3>
        <p className="text-sm leading-6 text-neutral-700">{product.shortDescription}</p>
        {!compact ? (
          <p className="text-sm text-neutral-700">
            {product.packFormats.map((format) => format.label).join(", ")}
          </p>
        ) : null}
        <Link
          href={`/products/${product.slug}`}
          className="mt-auto inline-flex min-h-11 items-center py-2 text-sm font-semibold text-[color:var(--brand-1)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand-1)]"
        >
          View Product
        </Link>
      </div>
    </article>
  );
}
