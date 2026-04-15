import Link from "next/link";

import { ImagePlaceholder } from "@/components/image-placeholder";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listCommerceFacets, listCommerceProducts } from "@/lib/commerce/service";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Products",
  description:
    "Browse Nest Foods bread products with pack sizes, ingredients, and direct enquiry-ready product information.",
  path: "/shop",
});

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

  const [products, facets] = await Promise.all([
    listCommerceProducts({ search, category, allergenExclude }),
    listCommerceFacets(),
  ]);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 md:px-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
        <div className="space-y-3">
          <Badge>Product Range</Badge>
          <h1 className="display-heading text-4xl text-neutral-900 sm:text-[3.15rem]">
            Bread Products Built For Consistency
          </h1>
          <p className="max-w-3xl text-sm text-neutral-600">
            Review the Nest Foods bread range by category, ingredient profile, pack size, and
            product notes. The catalogue stays product-first and supports direct enquiries without
            retail or operational workflow language.
          </p>
        </div>
        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Need guidance?
          </p>
          <p className="text-sm text-neutral-600">
            Contact Nest Foods for product questions, pack format guidance, or distributor
            introductions.
          </p>
          <Link href="/contact" className={buttonClassName({ variant: "secondary", size: "sm" })}>
            Contact Team
          </Link>
        </Card>
      </div>

      <Card className="space-y-4">
        <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-3" method="GET">
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">Search</span>
            <Input
              name="search"
              defaultValue={search ?? ""}
              placeholder="Search products, ingredients, or pack sizes..."
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">Category</span>
            <select
              name="category"
              defaultValue={category ?? ""}
              className="field-control h-11 px-3 text-sm"
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
            <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">
              Exclude allergen
            </span>
            <select
              name="allergenExclude"
              defaultValue={allergenExclude ?? ""}
              className="field-control h-11 px-3 text-sm"
            >
              <option value="">None</option>
              {facets.allergens.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-3 md:col-span-2 lg:col-span-3">
            <button type="submit" className={buttonClassName({ variant: "primary" })}>
              Apply
            </button>
            <Link href="/shop" className={buttonClassName({ variant: "secondary" })}>
              Reset
            </Link>
          </div>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const packSizes = product.variants
            .map((variant) => variant.sizeLabel ?? variant.name)
            .filter(Boolean)
            .join(", ");

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
                <h2 className="text-lg font-semibold text-neutral-900">{product.name}</h2>
                <p className="text-sm text-neutral-600">{product.shortDescription}</p>
                <p className="text-xs text-neutral-500">
                  Pack sizes: {packSizes || "Available on request"}
                </p>
                <p className="text-xs text-neutral-500">
                  Key ingredients: {product.ingredients.slice(0, 3).join(", ")}
                </p>
                <p className="text-xs text-neutral-500">
                  Formats: {product.variants.length} option
                  {product.variants.length === 1 ? "" : "s"}
                </p>
                <p className="text-xs text-neutral-500">Shelf life: {product.shelfLifeDays} days</p>
                <p className="text-xs text-neutral-500">
                  Allergens: {product.allergens.join(", ")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/products/${product.slug}`}
                  className={buttonClassName({ variant: "secondary", size: "sm" })}
                >
                  View Product
                </Link>
                <Link
                  href="/contact"
                  className={buttonClassName({ variant: "primary", size: "sm" })}
                >
                  Make Enquiry
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {products.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-neutral-600">
            No products matched your current filters. Try another product type or ingredient filter.
          </p>
        </Card>
      ) : null}
    </section>
  );
}
