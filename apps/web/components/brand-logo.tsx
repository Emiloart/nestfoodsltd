import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";

type BrandLogoProps = {
  href?: string | null;
  compact?: boolean;
  tone?: "default" | "inverse";
  className?: string;
};

export function BrandLogo({
  href = "/",
  compact = false,
  tone = "default",
  className,
}: BrandLogoProps) {
  const inverse = tone === "inverse";
  const content = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src="/placeholders/logo-placeholder.svg"
        alt="Nest Foods logo placeholder"
        width={compact ? 32 : 36}
        height={compact ? 32 : 36}
        priority
        unoptimized
        className={cn(
          inverse
            ? "h-9 w-9 rounded-2xl border border-white/14 bg-white/10 p-1 shadow-[0_12px_28px_rgba(10,6,18,0.2)]"
            : "h-9 w-9 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-1 shadow-[0_12px_28px_rgba(46,18,69,0.08)]",
          compact && "h-8 w-8",
        )}
      />
      <span className={cn("flex flex-col", compact && "hidden sm:flex")}>
        <span className={cn("section-kicker text-[0.58rem]", inverse && "text-[color:var(--brand-3)]")}>
          Nest Foods Ltd
        </span>
        <span
          className={cn(
            inverse ? "display-heading text-base text-white" : "display-heading text-base text-neutral-900",
            compact && "text-sm",
          )}
        >
          Premium bread manufacturing.
        </span>
      </span>
    </span>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      aria-label="Nest Foods home"
      className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]"
    >
      {content}
    </Link>
  );
}
