import { type ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/cn";

const variantStyles = {
  primary: "button-primary",
  secondary: "button-secondary",
  brand: "button-brand",
  ghost: "button-ghost",
} as const;

const sizeStyles = {
  sm: "h-9 px-4 text-[0.68rem]",
  md: "h-11 px-5 text-[0.72rem]",
  lg: "h-12 px-6 text-[0.76rem]",
  icon: "h-10 w-10 p-0",
} as const;

type ButtonVariant = keyof typeof variantStyles;
type ButtonSize = keyof typeof sizeStyles;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonClassNameOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-full border font-semibold uppercase tracking-[0.15em] transition-[transform,box-shadow,background-color,border-color,color,filter] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)] disabled:pointer-events-none disabled:opacity-50";

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: ButtonClassNameOptions = {}) {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size], className);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  );
});
