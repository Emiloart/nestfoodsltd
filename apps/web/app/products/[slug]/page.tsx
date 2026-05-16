import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductComparisonToggle } from "@/components/products/product-comparison-toggle";
import { ProductDetailTabs } from "@/components/products/product-detail-tabs";
import { ProductGallery } from "@/components/products/product-gallery";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCatalogueProductBySlug, listCatalogueProducts } from "@/lib/catalog/service";
import { getCompanyContent } from "@/lib/company/service";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildProductStructuredData } from "@/lib/seo/structured-data";
import { buildWhatsAppUrl, productWhatsAppMessage } from "@/lib/whatsapp";

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
  const [product, allProducts, company] = await Promise.all([
    getCatalogueProductBySlug(slug),
    listCatalogueProducts(),
    getCompanyContent(),
  ]);

  if (!product) {
    notFound();
    return null;
  }

  const productStructuredData = buildProductStructuredData(product);
  const packSizes = product.packFormats
    .map((format) => format.label)
    .filter(Boolean)
    .join(", ");
  const salesWhatsApp = company.whatsappContacts.find((contact) => contact.id === "sales") ??
    company.whatsappContacts[0];
  const whatsappUrl = buildWhatsAppUrl(
    salesWhatsApp?.phone ?? "08064107897",
    productWhatsAppMessage(product.name),
  );

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 md:px-6">
      <JsonLd id={`product-${product.slug}-ld`} data={productStructuredData} />
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <ProductGallery product={product} />

        <div className="space-y-6">
          <div className="space-y-3">
            <Badge>{product.category}</Badge>
            <h1 className="display-heading text-4xl text-neutral-900 sm:text-[3.15rem]">
              {product.name}
            </h1>
            <p className="text-sm text-neutral-600">{product.longDescription}</p>
            <p className="text-xs text-neutral-500">
              Size: {packSizes || "See product details"}
            </p>
            {product.shelfLife ? (
              <p className="text-xs text-neutral-500">Freshness: {product.shelfLife}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Link href="/contact" className={buttonClassName({ variant: "primary", size: "sm" })}>
                Make Enquiry
              </Link>
              <Link
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonClassName({ variant: "brand", size: "sm" })}
              >
                Chat on WhatsApp
              </Link>
            </div>
          </div>

          <Card className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              9-10 Day Freshness
            </p>
            <div className="grid grid-cols-10 gap-1.5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className={
                    index < 9
                      ? "h-3 rounded-full bg-[color:var(--brand-3)]"
                      : "h-3 rounded-full bg-[color:var(--action-2)]"
                  }
                />
              ))}
            </div>
            <p className="text-sm leading-7 text-neutral-600">
              {product.shelfLife ??
                "Follow the storage notes for best freshness."}
            </p>
          </Card>

          <div className="grid gap-4">
            <Card className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Product specifications
              </p>
              <p className="text-sm text-neutral-700">Category: {product.category}</p>
              <p className="text-sm text-neutral-700">
                Size: {packSizes || "See product details"}
              </p>
            </Card>
          </div>
        </div>
      </div>

      <ProductDetailTabs product={product} />

      <ProductComparisonToggle products={allProducts} />
    </section>
  );
}
