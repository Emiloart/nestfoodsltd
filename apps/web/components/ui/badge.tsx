import { type HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-overlay)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-neutral-700 dark:text-neutral-300",
        className,
      )}
      {...props}
    />
  );
}
