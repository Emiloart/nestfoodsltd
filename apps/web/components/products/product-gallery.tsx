"use client";

import { useMemo, useState } from "react";

import { ImagePlaceholder } from "@/components/image-placeholder";
import { cn } from "@/lib/cn";
import { type CatalogueProduct } from "@/lib/catalog/types";

type ProductGalleryProps = {
  product: CatalogueProduct;
};

export function ProductGallery({ product }: ProductGalleryProps) {
  const images = useMemo(() => {
    const galleryImages =
      product.galleryImages && product.galleryImages.length > 0
        ? product.galleryImages
        : product.galleryUrls.map((url, index) => ({
            url,
            altText: `${product.name} gallery image ${index + 1}`,
            label: index === 0 ? "Primary view" : `View ${index + 1}`,
          }));

    const primary = {
      url: product.imageUrl,
      altText: `${product.name} product image`,
      label: "Primary view",
    };

    return [primary, ...galleryImages.filter((entry) => entry.url !== primary.url)].slice(0, 6);
  }, [product]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? images[0];

  return (
    <div className="space-y-4">
      <div className="group overflow-hidden rounded-[1.6rem]">
        <ImagePlaceholder
          src={selectedImage?.url ?? product.imageUrl}
          alt={selectedImage?.altText ?? `${product.name} product image`}
          label={selectedImage?.label}
          fit="contain"
          className="aspect-[4/5] bg-[color:var(--surface-strong)] transition duration-500 group-hover:scale-[1.025] md:aspect-square"
          priority
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {images.map((image, index) => (
          <button
            key={`${image.url}-${index}`}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "rounded-[1.1rem] border p-1 transition hover:border-[color:var(--brand-1)]",
              selectedIndex === index
                ? "border-[color:var(--brand-1)] bg-[color:var(--bg-accent-brand)]"
                : "border-[color:var(--border)] bg-[color:var(--surface-strong)]",
            )}
          >
            <ImagePlaceholder
              src={image.url}
              alt={image.altText}
              label={image.label}
              fit="contain"
              className="aspect-square rounded-[0.9rem] bg-[color:var(--surface-strong)]"
            />
            <span className="sr-only">{image.label ?? `View ${index + 1}`}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
