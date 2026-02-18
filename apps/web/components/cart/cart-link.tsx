"use client";

import Link from "next/link";

import { useCart } from "./cart-provider";

export function CartLink() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className="inline-flex h-9 items-center rounded-full border border-neutral-200 px-3 text-xs font-medium text-neutral-700 transition hover:-translate-y-0.5 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900"
      aria-label={`Open cart with ${itemCount} item${itemCount === 1 ? "" : "s"}`}
    >
      Cart ({itemCount})
    </Link>
  );
}
