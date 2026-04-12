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
      className={cn("field-control h-11 px-3.5 text-sm", className)}
      {...props}
    />
  );
});
