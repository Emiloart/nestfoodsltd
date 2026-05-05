import Link from "next/link";

import { FadeIn } from "@/components/motion/fade-in";
import { MobileAutoCarousel } from "@/components/home/mobile-auto-carousel";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { Card } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { SectionHeading } from "@/components/home/section-heading";
import { type CatalogueProduct } from "@/lib/catalog/types";

type HomeProductRangeSectionProps = {
  products: CatalogueProduct[];
};

function ProductPreviewCard({ product }: { product: CatalogueProduct }) {
  const packSizes = product.packFormats
    .map((format) => format.label)
    .filter(Boolean)
    .join(", ");
  const ingredients = product.ingredients.join(", ");
  const allergens = product.allergens.join(", ");

  return (
    <Card className="h-full space-y-4">
      <Link href={`/products/${product.slug}`} className="block">
        <ImagePlaceholder
          src={product.imageUrl}
          alt={`${product.name} product image`}
          label="Product Image"
          className="aspect-[4/3]"
        />
      </Link>
      <div>
        <p className="section-kicker">{product.category}</p>
        <h3 className="mt-3 text-xl font-semibold text-neutral-900 md:text-2xl">{product.name}</h3>
        <p className="pretty-text mt-3 line-clamp-3 text-sm leading-7 text-neutral-600 md:line-clamp-none">
          {product.shortDescription}
        </p>
        <p className="mt-3 text-xs text-neutral-500">
          Size: {packSizes || "Available on request"}
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          Ingredients: {ingredients || "Available on request"}
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          Allergens: {allergens || "Available on request"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/products/${product.slug}`}
          className={buttonClassName({ variant: "secondary", size: "sm" })}
        >
          View Product
        </Link>
        <Link href="/contact" className={buttonClassName({ variant: "primary", size: "sm" })}>
          Make Enquiry
        </Link>
      </div>
    </Card>
  );
}

export function HomeProductRangeSection({ products }: HomeProductRangeSectionProps) {
  const featuredProducts = products.slice(0, 4);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:py-9">
      <SectionHeading
        eyebrow="Bread Product Range"
        title="Bread products ready for review and enquiry."
        description="Review the De-Nest Bread range by category, size, ingredients, allergens, and product notes."
        descriptionClassName="hidden md:block"
        actions={
          <Link href="/shop" className={buttonClassName({ variant: "secondary" })}>
            View Products
          </Link>
        }
      />

      <MobileAutoCarousel
        ariaLabel="Bread product previews"
        className="mt-5"
        intervalMs={2000}
        items={featuredProducts.map((product) => (
          <ProductPreviewCard key={product.id} product={product} />
        ))}
      />

      <div className="mt-5 hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
        {featuredProducts.map((product, index) => (
          <FadeIn key={product.id} delay={(index + 1) * 0.06}>
            <ProductPreviewCard product={product} />
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
