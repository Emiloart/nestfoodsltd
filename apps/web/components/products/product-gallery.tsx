"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { ProductImage } from "@/components/products/product-image";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import { type CatalogueProduct } from "@/lib/catalog/types";

type ProductGalleryProps = {
  product: CatalogueProduct;
};
const subscribeToHydration = () => () => {};

export function ProductGallery({ product }: ProductGalleryProps) {
  const interactive = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const selectedImage = images[selectedIndex] ?? images[0];

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setSelectedIndex((current) => (current + 1) % images.length);
      }
      if (event.key === "ArrowLeft") {
        setSelectedIndex((current) => (current - 1 + images.length) % images.length);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [images.length, lightboxOpen]);

  function showPreviousImage() {
    setSelectedIndex((current) => (current - 1 + images.length) % images.length);
  }

  function showNextImage() {
    setSelectedIndex((current) => (current + 1) % images.length);
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        disabled={!interactive}
        onClick={() => setLightboxOpen(true)}
        className="block w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-4"
      >
        <ProductImage
          src={selectedImage?.url ?? product.imageUrl}
          alt={selectedImage?.altText ?? `${product.name} product image`}
          priority
          sizes="(max-width: 1024px) 100vw, 46vw"
        />
        <span className="sr-only">Open product image gallery</span>
      </button>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={`${image.url}-${index}`}
            type="button"
            aria-pressed={selectedIndex === index}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "self-start rounded-2xl border-2 p-1 transition hover:border-[color:var(--brand-1)]",
              selectedIndex === index ? "border-[color:var(--brand-1)]" : "border-transparent",
            )}
          >
            <ProductImage
              src={image.url}
              alt={image.altText}
              className="rounded-xl"
              sizes="(max-width: 768px) 32vw, 12vw"
            />
            <span className="sr-only">{image.label ?? `View ${index + 1}`}</span>
          </button>
        ))}
      </div>

      {lightboxOpen ? (
        <Dialog
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          label={`${product.name} image gallery`}
          className="max-w-5xl border-white/20 bg-black p-4 text-white"
        >
          <div className="relative w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-0 top-0 z-10 min-h-11 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[color:var(--brand-2)] shadow-lg"
            >
              Close
            </button>

            <div className="overflow-hidden rounded-[1.2rem] bg-white/8">
              <ProductImage
                src={selectedImage?.url ?? product.imageUrl}
                alt={selectedImage?.altText ?? `${product.name} product image`}
                className="h-[min(78vh,54rem)]"
                priority
                sizes="100vw"
              />
            </div>

            {images.length > 1 ? (
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={showPreviousImage}
                  className="min-h-11 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/16"
                >
                  Previous
                </button>
                <p role="status" className="text-center text-sm font-semibold text-white">
                  {selectedIndex + 1} / {images.length}
                </p>
                <button
                  type="button"
                  onClick={showNextImage}
                  className="min-h-11 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/16"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}
