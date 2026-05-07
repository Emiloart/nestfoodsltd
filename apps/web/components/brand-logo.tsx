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
        width={compact ? 40 : 48}
        height={compact ? 40 : 48}
        priority
        className={cn(
          inverse
            ? "h-12 w-12 scale-[1.16] rounded-2xl border border-white/20 bg-white/92 object-cover object-center shadow-[0_12px_28px_rgba(10,6,18,0.28)]"
            : "h-12 w-12 scale-[1.16] rounded-2xl border border-[color:var(--border)] bg-white object-cover object-center shadow-[0_12px_28px_rgba(46,18,69,0.08)]",
          compact && "h-10 w-10",
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
