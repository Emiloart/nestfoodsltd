import Link from "next/link";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { AddToWishlistButton } from "@/components/customer/add-to-wishlist-button";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/commerce/format";
import { listCommerceFacets, listCommerceProducts } from "@/lib/commerce/service";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Shop",
  description:
    "Browse Nest Foods products with filters for category, allergens, tags, and availability.",
  path: "/shop",
});

type ShopPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    allergenExclude?: string;
    tag?: string;
    inStockOnly?: string;
    sort?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const search = params.search?.trim() || undefined;
  const category = params.category?.trim() || undefined;
  const allergenExclude = params.allergenExclude?.trim() || undefined;
  const tag = params.tag?.trim() || undefined;
  const inStockOnly = params.inStockOnly === "1";
  const sort =
    params.sort === "price_asc" || params.sort === "price_desc" ? params.sort : undefined;

  const [products, facets] = await Promise.all([
    listCommerceProducts({ search, category, allergenExclude, tag, inStockOnly, sort }),
    listCommerceFacets(),
  ]);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 md:px-6">
      <div className="space-y-3">
        <Badge>Commerce Catalog</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Shop
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Faceted search with categories, tags, allergen exclusion, and stock filters.
        </p>
      </div>

      <Card className="space-y-4">
        <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-3" method="GET">
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">Search</span>
            <Input
              name="search"
              defaultValue={search ?? ""}
              placeholder="Search products, tags, categories..."
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">Category</span>
            <select
              name="category"
              defaultValue={category ?? ""}
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            >
              <option value="">All categories</option>
              {facets.categories.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">Tag</span>
            <select
              name="tag"
              defaultValue={tag ?? ""}
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            >
              <option value="">All tags</option>
              {facets.tags.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">
              Exclude allergen
            </span>
            <select
              name="allergenExclude"
              defaultValue={allergenExclude ?? ""}
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            >
              <option value="">None</option>
              {facets.allergens.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">Sort</span>
            <select
              name="sort"
              defaultValue={sort ?? ""}
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            >
              <option value="">Relevance</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </label>
          <div className="flex items-end gap-3">
            <label className="flex h-11 items-center gap-2 rounded-xl border border-neutral-300 px-3 text-sm dark:border-neutral-700">
              <input
                type="checkbox"
                name="inStockOnly"
                value="1"
                defaultChecked={inStockOnly}
                className="h-4 w-4 rounded border-neutral-300"
              />
              In stock only
            </label>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-black dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Apply
            </button>
            <Link
              href="/shop"
              className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-300 px-5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-900"
            >
              Reset
            </Link>
          </div>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const defaultVariant = product.variants[0];
          if (!defaultVariant) {
            return null;
          }
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
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                  {product.category}
                </p>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {product.name}
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  {product.shortDescription}
                </p>
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(defaultVariant.currency, defaultVariant.priceMinor)}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Allergens: {product.allergens.join(", ")}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AddToCartButton variantId={defaultVariant.id} />
                  <AddToWishlistButton productSlug={product.slug} />
                </div>
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
            No products matched your filters. Try relaxing one filter or reset.
          </p>
        </Card>
      ) : null}
    </section>
  );
}
