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
        "relative overflow-hidden rounded-[1.6rem] border border-[color:var(--border)] bg-[color:var(--surface-overlay)]",
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
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
      <div className="absolute left-4 top-4 rounded-full border border-white/35 bg-black/45 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur">
        {label}
      </div>
    </div>
  );
}
