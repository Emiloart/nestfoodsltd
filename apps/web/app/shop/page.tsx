import Link from "next/link";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/commerce/format";
import { listCommerceCategories, listCommerceProducts } from "@/lib/commerce/service";

type ShopPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    allergenExclude?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const search = params.search?.trim() || undefined;
  const category = params.category?.trim() || undefined;
  const allergenExclude = params.allergenExclude?.trim() || undefined;

  const [products, categories] = await Promise.all([
    listCommerceProducts({ search, category, allergenExclude }),
    listCommerceCategories(),
  ]);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 md:px-6">
      <div className="space-y-3">
        <Badge>Commerce Catalog</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Shop</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Filter by category and allergens, then add variants directly to cart.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/shop"
          className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
        >
          All
        </Link>
        {categories.map((entry) => (
          <Link
            key={entry}
            href={`/shop?category=${encodeURIComponent(entry)}`}
            className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
          >
            {entry}
          </Link>
        ))}
        <Link
          href="/shop?allergenExclude=soy"
          className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
        >
          Soy-Free
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const defaultVariant = product.variants[0];
          return (
            <Card key={product.id} className="space-y-4">
              <Link href={`/products/${product.slug}`} className="block">
                <ImagePlaceholder
                  src={product.imageUrl}
                  alt={`${product.name} image placeholder`}
                  label="Product Placeholder"
                  className="aspect-square"
                />
              </Link>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">{product.category}</p>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{product.name}</h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">{product.shortDescription}</p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(defaultVariant.currency, defaultVariant.priceMinor)}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Allergens: {product.allergens.join(", ")}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <AddToCartButton variantId={defaultVariant.id} />
                <Link
                  href={`/products/${product.slug}`}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.15em] text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
                >
                  Details
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {products.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            No products matched your filter. Try a different category or search.
          </p>
        </Card>
      ) : null}
    </section>
  );
}
