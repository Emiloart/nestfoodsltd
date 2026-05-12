"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const selectedImage = images[selectedIndex] ?? images[0];

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }
      if (event.key === "ArrowRight") {
        setSelectedIndex((current) => (current + 1) % images.length);
      }
      if (event.key === "ArrowLeft") {
        setSelectedIndex((current) => (current - 1 + images.length) % images.length);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
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
        onClick={() => setLightboxOpen(true)}
        className="group block w-full overflow-hidden rounded-[1.45rem] bg-[color:var(--brand-2)] text-left shadow-[0_22px_44px_rgba(46,18,69,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]"
      >
        <ImagePlaceholder
          src={selectedImage?.url ?? product.imageUrl}
          alt={selectedImage?.altText ?? `${product.name} product image`}
          label={selectedImage?.label}
          decorated={false}
          className="product-card-media aspect-[2/3] bg-[color:var(--brand-2)] transition duration-500 group-hover:scale-[1.025]"
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
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "overflow-hidden rounded-[1rem] border bg-[color:var(--brand-2)] transition hover:border-[color:var(--brand-1)]",
              selectedIndex === index
                ? "border-[color:var(--brand-3)]"
                : "border-white/10",
            )}
          >
            <ImagePlaceholder
              src={image.url}
              alt={image.altText}
              label={image.label}
              decorated={false}
              className="product-card-media aspect-[2/3] bg-[color:var(--brand-2)]"
              sizes="(max-width: 768px) 32vw, 12vw"
            />
            <span className="sr-only">{image.label ?? `View ${index + 1}`}</span>
          </button>
        ))}
      </div>

      {lightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} image gallery`}
          className="fixed inset-0 z-[90] grid place-items-center bg-black/82 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-0 top-0 z-10 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[color:var(--brand-2)] shadow-lg"
            >
              Close
            </button>

            <div className="overflow-hidden rounded-[1.2rem] bg-white/8">
              <ImagePlaceholder
                src={selectedImage?.url ?? product.imageUrl}
                alt={selectedImage?.altText ?? `${product.name} product image`}
                label={selectedImage?.label}
                fit="contain"
                decorated={false}
                className="h-[min(78vh,54rem)] rounded-none border-0 bg-transparent"
                priority
                sizes="100vw"
              />
            </div>

            {images.length > 1 ? (
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={showPreviousImage}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/16"
                >
                  Previous
                </button>
                <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/72">
                  {selectedIndex + 1} / {images.length}
                </p>
                <button
                  type="button"
                  onClick={showNextImage}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/16"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
