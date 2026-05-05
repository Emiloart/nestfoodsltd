import Link from "next/link";

import { ImagePlaceholder } from "@/components/image-placeholder";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listCatalogueFacets, listCatalogueProducts } from "@/lib/catalog/service";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Products",
  description:
    "Browse De-Nest Bread products with ingredients, allergens, sizes, and enquiry-ready product information.",
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
    listCatalogueProducts({ search, category, allergenExclude }),
    listCatalogueFacets(),
  ]);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 md:px-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
        <div className="space-y-3">
          <Badge>Product Range</Badge>
          <h1 className="display-heading text-4xl text-neutral-900 sm:text-[3.15rem]">
            De-Nest Bread Product Catalogue
          </h1>
          <p className="max-w-3xl text-sm text-neutral-600">
            Review the De-Nest Bread range by category, ingredient profile, size, and product
            notes. The catalogue stays product-first and supports direct enquiries only.
          </p>
        </div>
        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Need guidance?
          </p>
          <p className="text-sm text-neutral-600">
            Contact Nest Foods Limited for product questions, size guidance, or general enquiries.
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
          const packSizes = product.packFormats
            .map((format) => format.label)
            .filter(Boolean)
            .join(", ");
          const ingredients = product.ingredients.slice(0, 4).join(", ");
          const allergens = product.allergens.join(", ");

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
                  Size: {packSizes || "Available on request"}
                </p>
                <p className="text-xs text-neutral-500">
                  Ingredients: {ingredients || "Available on request"}
                </p>
                <p className="text-xs text-neutral-500">
                  Allergens: {allergens || "Available on request"}
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
