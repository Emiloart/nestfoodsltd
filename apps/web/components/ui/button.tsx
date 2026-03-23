import { type ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/cn";

const variantStyles = {
  primary:
    "bg-[linear-gradient(135deg,var(--brand-1),var(--brand-2))] text-white shadow-[0_14px_30px_rgba(67,49,28,0.18)] hover:-translate-y-0.5 hover:brightness-105",
  secondary:
    "border border-[color:var(--border)] bg-[color:var(--surface-strong)] text-neutral-900 hover:-translate-y-0.5 hover:brightness-105 dark:text-neutral-100",
  ghost:
    "text-neutral-700 hover:bg-[color:var(--surface-strong)] dark:text-neutral-200 dark:hover:bg-[color:var(--surface-strong)]",
} as const;

const sizeStyles = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-sm",
  icon: "h-10 w-10",
} as const;

type ButtonVariant = keyof typeof variantStyles;
type ButtonSize = keyof typeof sizeStyles;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium tracking-[0.01em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-neutral-950",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
});
