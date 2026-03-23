import Link from "next/link";

import { FadeIn } from "@/components/motion/fade-in";
import { MobileAutoCarousel } from "@/components/home/mobile-auto-carousel";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/home/section-heading";
import { type CommerceProduct } from "@/lib/commerce/types";

type HomeProductRangeSectionProps = {
  products: CommerceProduct[];
};

function ProductPreviewCard({ product }: { product: CommerceProduct }) {
  return (
    <Card className="h-full space-y-5">
      <Link href={`/products/${product.slug}`} className="block">
        <ImagePlaceholder
          src={product.imageUrl}
          alt={`${product.name} placeholder`}
          label="Product Placeholder"
          className="aspect-[4/3]"
        />
      </Link>
      <div>
        <p className="section-kicker">{product.category}</p>
        <h3 className="mt-3 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {product.name}
        </h3>
        <p className="pretty-text mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
          {product.shortDescription}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4">
          <p className="text-xs uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
            Shelf life
          </p>
          <p className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {product.shelfLifeDays} days
          </p>
        </div>
        <div className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4">
          <p className="text-xs uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
            Coverage
          </p>
          <p className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {product.availableRegions.length} regions
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {product.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-neutral-600 dark:text-neutral-300"
          >
            {tag}
          </span>
        ))}
      </div>

      <Link
        href={`/products/${product.slug}`}
        className="inline-flex rounded-full border border-[color:var(--border)] px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] text-neutral-900 transition hover:-translate-y-0.5 hover:bg-[color:var(--surface-strong)] dark:text-neutral-100"
      >
        View Product
      </Link>
    </Card>
  );
}

export function HomeProductRangeSection({ products }: HomeProductRangeSectionProps) {
  const featuredProducts = products.slice(0, 3);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <SectionHeading
        eyebrow="Bread Product Range"
        title="Bread products that read quickly on mobile and desktop."
        description="The public catalog leads with clear product cues first. Ordering detail stays available without dominating the first view."
        descriptionClassName="hidden md:block"
        actions={
          <Link
            href="/shop"
            className="inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-3 text-xs font-medium uppercase tracking-[0.15em] text-neutral-900 transition hover:-translate-y-0.5 hover:brightness-105 dark:text-neutral-100"
          >
            View All Products
          </Link>
        }
      />

      <MobileAutoCarousel
        ariaLabel="Bread product previews"
        className="mt-6"
        intervalMs={2000}
        items={featuredProducts.map((product) => (
          <ProductPreviewCard key={product.id} product={product} />
        ))}
      />

      <div className="mt-6 hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-3">
        {featuredProducts.map((product, index) => (
          <FadeIn key={product.id} delay={(index + 1) * 0.06}>
            <ProductPreviewCard product={product} />
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
