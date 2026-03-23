import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  actions?: ReactNode;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  actions,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="max-w-3xl">
        <p className="section-kicker">{eyebrow}</p>
        <h2 className="display-heading mt-3 text-3xl text-neutral-900 dark:text-neutral-100 sm:text-4xl">
          {title}
        </h2>
      </div>
      {(description || actions) ? (
        <div className="max-w-xl">
          {description ? (
            <p className="pretty-text text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              {description}
            </p>
          ) : null}
          {actions ? <div className={description ? "mt-4" : ""}>{actions}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
