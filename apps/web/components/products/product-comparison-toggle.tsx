"use client";

import Link from "next/link";
import { useState } from "react";

import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type CatalogueProduct } from "@/lib/catalog/types";

type ProductComparisonToggleProps = {
  products: CatalogueProduct[];
};

export function ProductComparisonToggle({ products }: ProductComparisonToggleProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Compare Products
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            Compare size, use case, and freshness across the De-Nest Bread range.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={buttonClassName({ variant: "secondary", size: "sm" })}
        >
          {open ? "Hide Comparison" : "Show Comparison"}
        </button>
      </div>

      {open ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Size</th>
                <th className="px-3 py-2">Best for</th>
                <th className="px-3 py-2">Freshness</th>
              </tr>
            </thead>
            <tbody>
              {products.map((entry) => (
                <tr key={entry.id} className="bg-[color:var(--surface-strong)]">
                  <td className="rounded-l-[1rem] px-3 py-3 font-semibold text-neutral-900">
                    <Link href={`/products/${entry.slug}`} className="hover:text-[color:var(--brand-1)]">
                      {entry.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-neutral-600">
                    {entry.packFormats.map((format) => format.label).join(", ")}
                  </td>
                  <td className="px-3 py-3 text-neutral-600">
                    {entry.bestFor.slice(0, 2).join(", ")}
                  </td>
                  <td className="rounded-r-[1rem] px-3 py-3 text-neutral-600">
                    {entry.shelfLife ?? "Follow storage notes"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </Card>
  );
}
