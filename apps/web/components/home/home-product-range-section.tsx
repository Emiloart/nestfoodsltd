import Link from "next/link";

import { FadeIn } from "@/components/motion/fade-in";
import { MobileAutoCarousel } from "@/components/home/mobile-auto-carousel";
import { ProductEditorialCard } from "@/components/products/product-editorial-card";
import { buttonClassName } from "@/components/ui/button";
import { SectionHeading } from "@/components/home/section-heading";
import { type CatalogueProduct } from "@/lib/catalog/types";

type HomeProductRangeSectionProps = {
  products: CatalogueProduct[];
};

export function HomeProductRangeSection({ products }: HomeProductRangeSectionProps) {
  const featuredProducts = products.slice(0, 4);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:py-9">
      <SectionHeading
        eyebrow="Bread Product Range"
        title="De-Nest Bread Product Range"
        description=""
        descriptionClassName="hidden md:block"
        actions={
          <Link href="/products" className={buttonClassName({ variant: "secondary" })}>
            View Products
          </Link>
        }
      />

      <MobileAutoCarousel
        ariaLabel="Bread product previews"
        className="mt-5"
        intervalMs={2000}
        items={featuredProducts.map((product) => (
          <ProductEditorialCard key={product.id} product={product} />
        ))}
      />

      <div className="mt-5 hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
        {featuredProducts.map((product, index) => (
          <FadeIn key={product.id} delay={(index + 1) * 0.06}>
            <ProductEditorialCard product={product} />
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
