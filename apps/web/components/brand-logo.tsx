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
        src="/brand/logos/logo-primary.png"
        alt="De-Nest Bread logo"
        width={compact ? 56 : 72}
        height={compact ? 56 : 72}
        priority
        className={cn(
          "h-14 w-auto object-contain object-center",
          compact && "h-11",
        )}
      />
      <span className={cn("flex flex-col", compact && "hidden sm:flex")}>
        <span className={cn("section-kicker text-[0.58rem]", inverse && "text-[color:var(--brand-3)]")}>
          De-Nest Bread
        </span>
        <span
          className={cn(
            inverse ? "display-heading text-base text-white" : "display-heading text-base text-neutral-900",
            compact && "text-sm",
          )}
        >
          Nest Foods Limited
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
      aria-label="De-Nest Bread home"
      className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]"
    >
      {content}
    </Link>
  );
}
