import Image, { type StaticImageData } from "next/image";

import { cn } from "@/lib/cn";
import jumboPackaged from "@/public/media/products/de-nest-family-jumbo-bread-packaged.jpg";
import jumboSlices from "@/public/media/products/de-nest-family-jumbo-bread-with-slices.png";
import familyLoaf from "@/public/media/products/nestfoodsltd-family-loaf.png";
import familyTexture from "@/public/media/products/nestfoodsltd-family-loaf-texture.png";
import unpackedLoaf from "@/public/media/products/nestfoodsltd-unpacked-loaf.png";
import slicedBread from "@/public/media/products/nestfoodsltd-sliced-bread.png";
import slicedBreadSecond from "@/public/media/products/nestfoodsltd-sliced-bread-2.png";
import midiLoaf from "@/public/media/products/nestfoodsltd-midi-loaf.png";
import midiTexture from "@/public/media/products/nestfoodsltd-midi-loaf-texture.png";
import midiUnpacked from "@/public/media/products/nestfoodsltd-midi-loaf-unpacked.png";

const artwork: Record<string, StaticImageData> = {
  "/media/products/de-nest-family-jumbo-bread-packaged.jpg": jumboPackaged,
  "/media/products/de-nest-family-jumbo-bread-with-slices.png": jumboSlices,
  "/media/products/nestfoodsltd-family-loaf.png": familyLoaf,
  "/media/products/nestfoodsltd-family-loaf-texture.png": familyTexture,
  "/media/products/nestfoodsltd-unpacked-loaf.png": unpackedLoaf,
  "/media/products/nestfoodsltd-sliced-bread.png": slicedBread,
  "/media/products/nestfoodsltd-sliced-bread-2.png": slicedBreadSecond,
  "/media/products/nestfoodsltd-midi-loaf.png": midiLoaf,
  "/media/products/nestfoodsltd-midi-loaf-texture.png": midiTexture,
  "/media/products/nestfoodsltd-midi-loaf-unpacked.png": midiUnpacked,
};

export function ProductImage({
  src,
  alt,
  className,
  priority = false,
  sizes = "(max-width: 640px) 92vw, (max-width: 1280px) 45vw, 30vw",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const original = artwork[src];
  return (
    <Image
      src={original ?? src}
      alt={alt}
      width={original?.width ?? 720}
      height={original?.height ?? 720}
      className={cn("block h-auto w-full rounded-2xl object-contain", className)}
      sizes={sizes}
      priority={priority}
      unoptimized={!original && (!src.startsWith("/") || src.toLowerCase().includes(".svg"))}
    />
  );
}
