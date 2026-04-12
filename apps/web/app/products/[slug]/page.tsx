import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RecentlyViewedTracker } from "@/components/customer/recently-viewed-tracker";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCommerceProductBySlug } from "@/lib/commerce/service";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildProductStructuredData } from "@/lib/seo/structured-data";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const product = await getCommerceProductBySlug(slug);

  if (!product) {
    return buildPageMetadata({
      title: "Product Not Found",
      description: "The requested product could not be found.",
      path: `/products/${slug}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: product.name,
    description: product.shortDescription,
    path: `/products/${product.slug}`,
    ogImageUrl: product.imageUrl,
  });
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await Promise.resolve(params);
  const product = await getCommerceProductBySlug(slug);

  if (!product) {
    notFound();
    return null;
  }

  const productStructuredData = buildProductStructuredData(product);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 md:px-6">
      <JsonLd id={`product-${product.slug}-ld`} data={productStructuredData} />
      <RecentlyViewedTracker productSlug={product.slug} />
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <ImagePlaceholder
            src={product.imageUrl}
            alt={`${product.name} image placeholder`}
            label="Product Image Placeholder"
            className="aspect-square"
          />
          <div className="grid grid-cols-2 gap-3">
            {product.galleryUrls.map((entry, index) => (
              <ImagePlaceholder
                key={`${entry}-${index}`}
                src={entry}
                alt={`${product.name} gallery placeholder`}
                label={`Gallery ${index + 1}`}
                className="aspect-square"
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Badge>{product.category}</Badge>
            <h1 className="display-heading text-4xl text-neutral-900 dark:text-neutral-100 sm:text-[3.15rem]">
              {product.name}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {product.longDescription}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Availability: {product.availabilityStatus}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Planning range: {product.minimumOrderQuantity} - {product.maximumOrderQuantity} units
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Regions: {product.availableRegions.join(", ")}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/contact"
                className={buttonClassName({ variant: "primary", size: "sm" })}
              >
                Enquire About This Product
              </Link>
              <Link
                href="/traceability"
                className={buttonClassName({ variant: "secondary", size: "sm" })}
              >
                Quality & Traceability
              </Link>
            </div>
          </div>

          <Card className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Formats
            </p>
            <div className="space-y-3">
              {product.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {variant.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {variant.sku} · {variant.stockStatus.replace("_", " ")}
                    </p>
                  </div>
                  <Link
                    href="/contact"
                    className={buttonClassName({ variant: "secondary", size: "sm" })}
                  >
                    {variant.stockStatus === "out_of_stock" ||
                    product.availabilityStatus === "unavailable"
                      ? "Ask About Restock"
                      : "Ask About This Format"}
                  </Link>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Product specifications
              </p>
              <p className="text-sm text-neutral-700 dark:text-neutral-200">
                Category: {product.category}
              </p>
              <p className="text-sm text-neutral-700 dark:text-neutral-200">
                Shelf life: {product.shelfLifeDays} days
              </p>
              <p className="text-sm text-neutral-700 dark:text-neutral-200">
                Regions: {product.availableRegions.join(", ")}
              </p>
            </Card>
            <Card className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Quality access
              </p>
              <p className="text-sm text-neutral-700 dark:text-neutral-200">
                Review batch traceability, production checkpoints, and certification context before
                product discussions.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/traceability"
                  className={buttonClassName({ variant: "secondary", size: "sm" })}
                >
                  Quality & Traceability
                </Link>
                <Link
                  href="/contact"
                  className={buttonClassName({ variant: "primary", size: "sm" })}
                >
                  Contact Team
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Ingredients
          </p>
          <ul className="space-y-1 text-sm text-neutral-700 dark:text-neutral-200">
            {product.ingredients.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Allergens
          </p>
          <ul className="space-y-1 text-sm text-neutral-700 dark:text-neutral-200">
            {product.allergens.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Nutrition Facts
        </p>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {product.nutritionTable.map((entry) => (
            <div
              key={entry.label}
              className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-3"
            >
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{entry.label}</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {entry.amount}
                {entry.unit}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
