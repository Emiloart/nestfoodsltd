import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

type MockPanelProps = {
  label: string;
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
};

export function MockPanel({ label, title, description, className, children }: MockPanelProps) {
  return (
    <div className={cn("placeholder-panel p-5 sm:p-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="section-kicker">{label}</p>
        <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
          Placeholder
        </span>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
      {description ? (
        <p className="pretty-text mt-2 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
          {description}
        </p>
      ) : null}
      <div className="relative mt-5">{children}</div>
    </div>
  );
}
