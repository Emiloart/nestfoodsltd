import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductComparisonToggle } from "@/components/products/product-comparison-toggle";
import { ProductDetailTabs } from "@/components/products/product-detail-tabs";
import { ProductGallery } from "@/components/products/product-gallery";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { isProductComingSoon } from "@/lib/catalog/availability";
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

  const comingSoon = isProductComingSoon(product);
  const enquiryUrl = `/contact?product=${encodeURIComponent(product.slug)}#enquiry`;
  const productStructuredData = buildProductStructuredData(product);
  const packSizes = product.packFormats
    .map((format) => format.label)
    .filter(Boolean)
    .join(", ");
  const salesWhatsApp =
    company.whatsappContacts.find((contact) => contact.id === "sales") ??
    company.whatsappContacts[0];
  const whatsappUrl = buildWhatsAppUrl(
    salesWhatsApp?.phone ?? "08064107897",
    productWhatsAppMessage(product.name),
  );

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 md:px-6">
      <JsonLd id={`product-${product.slug}-ld`} data={productStructuredData} />
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-sm text-neutral-700"
      >
        <Link href="/products" className="min-h-11 py-3 underline underline-offset-4">
          Products
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <div className="space-y-5 lg:order-last">
          <Badge>{product.category}</Badge>
          <h1 className="display-heading text-3xl text-neutral-900 sm:text-5xl">{product.name}</h1>
          {comingSoon ? (
            <p className="rounded-xl bg-[color:var(--brand-3)] px-4 py-3 text-sm font-semibold text-[color:var(--brand-2)]">
              Coming soon — contact our team for availability updates.
            </p>
          ) : null}
          <p className="text-base leading-7 text-neutral-700">{product.shortDescription}</p>
          <dl className="space-y-3 rounded-2xl border border-[color:var(--border)] bg-white p-5 text-sm text-neutral-700">
            <div>
              <dt className="font-semibold text-neutral-900">Pack size</dt>
              <dd className="mt-1">{packSizes || "Ask our team for current pack sizes"}</dd>
            </div>
            {product.shelfLife ? (
              <div>
                <dt className="font-semibold text-neutral-900">Freshness and storage</dt>
                <dd className="mt-1">{product.shelfLife}</dd>
              </div>
            ) : null}
          </dl>
          <div className="flex flex-wrap gap-3">
            <Link href={enquiryUrl} className={buttonClassName({ variant: "primary" })}>
              {comingSoon ? "Ask about availability" : "Make Enquiry"}
            </Link>
            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonClassName({ variant: "secondary" })}
            >
              WhatsApp Sales
            </Link>
          </div>
        </div>
        <ProductGallery product={product} />
      </div>

      <ProductDetailTabs product={product} />

      <ProductComparisonToggle products={allProducts} />
    </section>
  );
}
