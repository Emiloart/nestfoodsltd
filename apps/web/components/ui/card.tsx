import { type HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return <div className={cn("card-surface rounded-[1.6rem] p-6 sm:p-7", className)} {...props} />;
}
