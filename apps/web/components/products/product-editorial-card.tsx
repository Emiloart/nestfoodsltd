import Link from "next/link";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { buttonClassName } from "@/components/ui/button";
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
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-[color:var(--brand-2)] text-white shadow-lg">
      <Link
        href={`/products/${product.slug}`}
        aria-label={`View ${product.name}`}
        className="block focus-visible:outline-2 focus-visible:outline-[color:var(--brand-3)]"
      >
        <ImagePlaceholder
          src={product.imageUrl}
          alt={product.name}
          decorated={false}
          fit="contain"
          className="product-card-media aspect-[4/3] bg-[color:var(--brand-2)]"
          sizes="(max-width: 640px) 92vw, (max-width: 1280px) 45vw, 30vw"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/85">
          <span>{product.category}</span>
          {comingSoon ? (
            <span className="rounded-full bg-[color:var(--brand-3)] px-3 py-1 text-[color:var(--brand-2)]">
              Coming soon
            </span>
          ) : null}
        </div>
        <h3 className="text-xl font-bold leading-snug">{product.name}</h3>
        <p className="line-clamp-2 text-sm leading-6 text-white/85">{product.shortDescription}</p>
        {!compact ? (
          <dl className="grid gap-3 border-t border-white/20 pt-3 text-sm">
            <div>
              <dt className="text-xs font-semibold text-white/80">Pack size</dt>
              <dd className="mt-1">
                {product.packFormats.map((format) => format.label).join(", ")}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-white/80">Best for</dt>
              <dd className="mt-1 line-clamp-1">{product.bestFor.slice(0, 2).join(", ")}</dd>
            </div>
          </dl>
        ) : null}
        <Link
          href={`/products/${product.slug}`}
          className={buttonClassName({ variant: "primary", className: "mt-auto w-full" })}
        >
          View Product
        </Link>
      </div>
    </article>
  );
}
