import Image from "next/image";

import { cn } from "@/lib/cn";

type ImagePlaceholderProps = {
  src: string;
  alt: string;
  label: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

function isLocalSource(source: string) {
  return source.startsWith("/");
}

function isSvgSource(source: string) {
  return source.toLowerCase().includes(".svg");
}

export function ImagePlaceholder({
  src,
  alt,
  label,
  className,
  priority = false,
  sizes,
}: ImagePlaceholderProps) {
  const useOptimizedImage = isLocalSource(src);
  const responsiveSizes = sizes ?? "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
    >
      {useOptimizedImage ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={responsiveSizes}
          className="object-cover"
          unoptimized={isSvgSource(src)}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-x-3 bottom-3 rounded-lg bg-black/55 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-white">
        {label}
      </div>
    </div>
  );
}
