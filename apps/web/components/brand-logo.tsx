import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";

type BrandLogoProps = {
  href?: string | null;
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ href = "/", compact = false, className }: BrandLogoProps) {
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
          "h-9 w-9 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-1 shadow-[0_10px_24px_rgba(63,43,23,0.08)]",
          compact && "h-8 w-8",
        )}
      />
      <span className={cn("flex flex-col", compact && "hidden sm:flex")}>
        <span className="section-kicker text-[0.58rem]">Nest Foods Ltd</span>
        <span
          className={cn(
            "display-heading text-base text-neutral-900 dark:text-neutral-100",
            compact && "text-sm",
          )}
        >
          Trusted nutrition.
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
      className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
    >
      {content}
    </Link>
  );
}
