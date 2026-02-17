import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { AddToWishlistButton } from "@/components/customer/add-to-wishlist-button";
import { RecentlyViewedTracker } from "@/components/customer/recently-viewed-tracker";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/commerce/format";
import { getCommerceProductBySlug } from "@/lib/commerce/service";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await Promise.resolve(params);
  const product = await getCommerceProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 md:px-6">
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
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              {product.name}
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">{product.longDescription}</p>
            <AddToWishlistButton productSlug={product.slug} />
          </div>

          <Card className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Variants</p>
            <div className="space-y-3">
              {product.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
                >
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{variant.name}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {variant.sku} · {variant.stockStatus.replace("_", " ")}
                    </p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(variant.currency, variant.priceMinor)}
                    </p>
                  </div>
                  <AddToCartButton variantId={variant.id} disabled={variant.stockStatus === "out_of_stock"} />
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Ingredients</p>
              <ul className="space-y-1 text-sm text-neutral-700 dark:text-neutral-200">
                {product.ingredients.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </Card>
            <Card className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Allergens</p>
              <ul className="space-y-1 text-sm text-neutral-700 dark:text-neutral-200">
                {product.allergens.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Shelf life: {product.shelfLifeDays} days
              </p>
            </Card>
          </div>
        </div>
      </div>

      <Card className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Nutrition Facts</p>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {product.nutritionTable.map((entry) => (
            <div key={entry.label} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
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
