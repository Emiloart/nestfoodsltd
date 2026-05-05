import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ImagePlaceholder } from "@/components/image-placeholder";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCatalogueProductBySlug } from "@/lib/catalog/service";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildProductStructuredData } from "@/lib/seo/structured-data";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const product = await getCatalogueProductBySlug(slug);

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
  const product = await getCatalogueProductBySlug(slug);

  if (!product) {
    notFound();
    return null;
  }

  const productStructuredData = buildProductStructuredData(product);
  const packSizes = product.packFormats
    .map((format) => format.label)
    .filter(Boolean)
    .join(", ");

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 md:px-6">
      <JsonLd id={`product-${product.slug}-ld`} data={productStructuredData} />
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <ImagePlaceholder
            src={product.imageUrl}
            alt={`${product.name} product image`}
            label="Product Image"
            className="aspect-square"
          />
          <div className="grid grid-cols-2 gap-3">
            {product.galleryUrls.map((entry, index) => (
              <ImagePlaceholder
                key={`${entry}-${index}`}
                src={entry}
                alt={`${product.name} gallery image ${index + 1}`}
                label={`Gallery ${index + 1}`}
                className="aspect-square"
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Badge>{product.category}</Badge>
            <h1 className="display-heading text-4xl text-neutral-900 sm:text-[3.15rem]">
              {product.name}
            </h1>
            <p className="text-sm text-neutral-600">{product.longDescription}</p>
            <p className="text-xs text-neutral-500">
              Size: {packSizes || "Available on request"}
            </p>
            <p className="text-xs text-neutral-500">
              Ingredients: {product.ingredients.join(", ")}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/contact" className={buttonClassName({ variant: "primary", size: "sm" })}>
                Make Enquiry
              </Link>
            </div>
          </div>

          <Card className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Formats
            </p>
            <div className="space-y-3">
              {product.packFormats.map((format) => (
                <div
                  key={format.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {format.label}
                    </p>
                  </div>
                  <Link
                    href="/contact"
                    className={buttonClassName({ variant: "secondary", size: "sm" })}
                  >
                    Make Enquiry
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
              <p className="text-sm text-neutral-700">Category: {product.category}</p>
              <p className="text-sm text-neutral-700">
                Size: {packSizes || "Available on request"}
              </p>
            </Card>
            <Card className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Product enquiries
              </p>
              <p className="text-sm text-neutral-700">
                Use the contact route for product questions, size guidance, and general follow-up.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/contact"
                  className={buttonClassName({ variant: "primary", size: "sm" })}
                >
                  Make Enquiry
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
          <ul className="space-y-1 text-sm text-neutral-700">
            {product.ingredients.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Allergens
          </p>
          <ul className="space-y-1 text-sm text-neutral-700">
            {product.allergens.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Nutrition Notes
        </p>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {product.nutritionNotes.map((entry) => (
            <div
              key={entry.label}
              className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-3"
            >
              <p className="text-xs text-neutral-500">{entry.label}</p>
              <p className="text-sm font-semibold text-neutral-900">{entry.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
