import { type InputHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-[1.1rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3.5 text-sm text-neutral-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:text-neutral-100 dark:placeholder:text-neutral-400",
        className,
      )}
      {...props}
    />
  );
});
