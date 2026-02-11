import { type HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none",
        className,
      )}
      {...props}
    />
  );
}
