import Image from "next/image";

import { cn } from "@/lib/cn";

type ImagePlaceholderProps = {
  src: string;
  alt: string;
  label?: string;
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
        "placeholder-panel relative overflow-hidden bg-[color:var(--surface-overlay)]",
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
        // Remote placeholder sources are not guaranteed to be configured for next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 h-18 bg-[color:color-mix(in_srgb,var(--brand-2)_16%,transparent)]" />
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}
