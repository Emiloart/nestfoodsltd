import { type InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  wrapperClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, wrapperClassName, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const field = (
    <input
      ref={ref}
      id={inputId}
      className={cn("field-control h-11 px-3.5 text-base", className)}
      {...props}
      aria-invalid={error ? true : props["aria-invalid"]}
      aria-describedby={
        [props["aria-describedby"], error ? errorId : ""].filter(Boolean).join(" ") || undefined
      }
    />
  );
  if (!label) return field;
  return (
    <div className={cn("grid gap-1.5 text-sm font-medium text-neutral-800", wrapperClassName)}>
      <label htmlFor={inputId}>{label}</label>
      {field}
      {error ? (
        <span id={errorId} role="alert" className="text-sm text-red-800">
          {error}
        </span>
      ) : null}
    </div>
  );
});
