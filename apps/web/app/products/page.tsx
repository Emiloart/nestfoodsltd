import Link from "next/link";

import { ImagePlaceholder } from "@/components/image-placeholder";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listCatalogueFacets, listCatalogueProducts } from "@/lib/catalog/service";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { WHATSAPP_CONTACTS, buildWhatsAppUrl, productWhatsAppMessage } from "@/lib/whatsapp";

export const metadata = buildPageMetadata({
  title: "Products",
  description:
    "Browse De-Nest Bread products with ingredients, allergens, sizes, and enquiry-ready product information.",
  path: "/products",
});

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    allergenExclude?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const search = params.search?.trim() || undefined;
  const category = params.category?.trim() || undefined;
  const allergenExclude = params.allergenExclude?.trim() || undefined;

  const [products, facets] = await Promise.all([
    listCatalogueProducts({ search, category, allergenExclude }),
    listCatalogueFacets(),
  ]);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 md:space-y-8 md:px-6 md:py-16">
      <div className="space-y-3">
        <Badge>Product Range</Badge>
        <h1 className="display-heading text-4xl text-neutral-900 sm:text-[3.15rem]">
          De-Nest Bread Product Catalogue
        </h1>
      </div>

      <Card className="space-y-4 p-4 md:p-[var(--space-card)]">
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
            <Link href="/products" className={buttonClassName({ variant: "secondary" })}>
              Reset
            </Link>
          </div>
        </form>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => {
          const packSizes = product.packFormats
            .map((format) => format.label)
            .filter(Boolean)
            .join(", ");
          const ingredients = product.ingredients.join(", ");
          const allergens = product.allergens.join(", ");
          const bestFor = product.bestFor.slice(0, 2).join(", ");
          const whatsappUrl = buildWhatsAppUrl(
            WHATSAPP_CONTACTS.sales.phone,
            productWhatsAppMessage(product.name),
          );

          return (
            <Card key={product.id} className="space-y-4 p-3 sm:p-4 md:p-[var(--space-card)]">
              <Link href={`/products/${product.slug}`} className="block">
                <ImagePlaceholder
                  src={product.imageUrl}
                  alt={`${product.name} product image`}
                  label="Product Image"
                  fit="contain"
                  className="aspect-[4/5] bg-[color:var(--surface-strong)] sm:aspect-[3/4]"
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
                {bestFor ? <p className="text-xs text-neutral-500">Best for: {bestFor}</p> : null}
                <p className="text-xs text-neutral-500">
                  Ingredients: {ingredients || "Available on request"}
                </p>
                <p className="text-xs text-neutral-500">
                  Allergens: {allergens || "Available on request"}
                </p>
              </div>
              <div className="grid gap-2 min-[420px]:grid-cols-3">
                <Link
                  href={`/products/${product.slug}`}
                  className={buttonClassName({ variant: "secondary", size: "sm", className: "w-full" })}
                >
                  View Product
                </Link>
                <Link
                  href="/contact"
                  className={buttonClassName({ variant: "primary", size: "sm", className: "w-full" })}
                >
                  Make Enquiry
                </Link>
                <Link
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClassName({ variant: "brand", size: "sm", className: "w-full" })}
                >
                  Chat on WhatsApp
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
