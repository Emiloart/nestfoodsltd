import { type HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[color:var(--border-strong)] bg-[color:color-mix(in_srgb,var(--surface-accent)_74%,white)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-1)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
        className,
      )}
      {...props}
    />
  );
}
