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
    "Browse Nest Foods bread products with production specs, availability, and enquiry-ready product information.",
  path: "/shop",
});

type ShopPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    allergenExclude?: string;
    tag?: string;
    region?: string;
    inStockOnly?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const search = params.search?.trim() || undefined;
  const category = params.category?.trim() || undefined;
  const allergenExclude = params.allergenExclude?.trim() || undefined;
  const tag = params.tag?.trim() || undefined;
  const region = params.region?.trim() || undefined;
  const inStockOnly = params.inStockOnly === "1";

  const [products, facets] = await Promise.all([
    listCommerceProducts({ search, category, allergenExclude, tag, region, inStockOnly }),
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
            Review the Nest Foods bread range by category, ingredient profile, service region, and
            production availability. The catalog stays product-first and supports direct enquiries
            for product discussions and supply planning.
          </p>
        </div>
        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Quality access
          </p>
          <p className="text-sm text-neutral-600">
            Need batch verification before procurement or review?
          </p>
          <Link
            href="/traceability"
            className={buttonClassName({ variant: "secondary", size: "sm" })}
          >
            Open Traceability
          </Link>
        </Card>
      </div>

      <Card className="space-y-4">
        <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-4" method="GET">
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
            <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">Tag</span>
            <select
              name="tag"
              defaultValue={tag ?? ""}
              className="field-control h-11 px-3 text-sm"
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
            <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">Region</span>
            <select
              name="region"
              defaultValue={region ?? ""}
              className="field-control h-11 px-3 text-sm"
            >
              <option value="">All regions</option>
              {facets.regions.map((entry) => (
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
          <div className="flex items-end gap-3 md:col-span-2 lg:col-span-4">
            <label className="flex h-11 items-center gap-2 rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-strong)] px-3 text-sm text-[color:var(--foreground)] shadow-[0_10px_26px_rgba(46,18,69,0.04)]">
              <input
                type="checkbox"
                name="inStockOnly"
                value="1"
                defaultChecked={inStockOnly}
                className="h-4 w-4 rounded border-[color:var(--border-strong)] accent-[color:var(--brand-1)]"
              />
              Currently available
            </label>
            <button
              type="submit"
              className={buttonClassName({ variant: "primary" })}
            >
              Apply
            </button>
            <Link
              href="/shop"
              className={buttonClassName({ variant: "secondary" })}
            >
              Reset
            </Link>
          </div>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const isAvailable =
            product.availabilityStatus !== "unavailable" &&
            product.variants.some((variant) => variant.stockStatus !== "out_of_stock");

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
                <h2 className="text-lg font-semibold text-neutral-900">
                  {product.name}
                </h2>
                <p className="text-sm text-neutral-600">
                  {product.shortDescription}
                </p>
                <p className="text-xs text-neutral-500">
                  Availability: {product.availabilityStatus}
                </p>
                <p className="text-xs text-neutral-500">
                  Planning range: {product.minimumOrderQuantity} - {product.maximumOrderQuantity} units
                </p>
                <p className="text-xs text-neutral-500">
                  Regions: {product.availableRegions.join(", ")}
                </p>
                <p className="text-xs text-neutral-500">
                  Formats: {product.variants.length} option{product.variants.length === 1 ? "" : "s"}
                </p>
                <p className="text-xs text-neutral-500">
                  Shelf life: {product.shelfLifeDays} days
                </p>
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
                  {isAvailable ? "Make Enquiry" : "Ask About Availability"}
                </Link>
                <Link
                  href="/traceability"
                  className={buttonClassName({ variant: "secondary", size: "sm" })}
                >
                  Trace Batch
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {products.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-neutral-600">
            No products matched your filters. Try another region, tag, or allergen setting.
          </p>
        </Card>
      ) : null}
    </section>
  );
}
