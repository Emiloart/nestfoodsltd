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
      <img
        src="/placeholders/logo-placeholder.svg"
        alt="Nest Foods logo placeholder"
        className={cn("h-9 w-9 rounded-xl border border-neutral-200 dark:border-neutral-800", compact && "h-8 w-8")}
      />
      <span className={cn("text-sm font-semibold tracking-[0.18em] text-neutral-900 dark:text-neutral-100", compact && "hidden sm:inline-flex")}>
        NEST FOODS LTD
      </span>
    </span>
  );

  if (!href) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}
