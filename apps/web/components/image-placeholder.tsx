import { cn } from "@/lib/cn";

type ImagePlaceholderProps = {
  src: string;
  alt: string;
  label: string;
  className?: string;
};

export function ImagePlaceholder({ src, alt, label, className }: ImagePlaceholderProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900", className)}>
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      <div className="absolute inset-x-3 bottom-3 rounded-lg bg-black/55 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-white">
        {label}
      </div>
    </div>
  );
}
