"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { type CatalogueProduct } from "@/lib/catalog/types";

type ProductDetailTabsProps = {
  product: CatalogueProduct;
};

const tabs = [
  { id: "description", label: "Description" },
  { id: "ingredients", label: "Ingredients" },
  { id: "nutrition", label: "Nutrition" },
  { id: "storage", label: "Storage" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ProductDetailTabs({ product }: ProductDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const nutrition = product.nutrition && product.nutrition.length > 0 ? product.nutrition : product.nutritionNotes;

  return (
    <Card className="space-y-5">
      <div
        role="tablist"
        aria-label={`${product.name} product details`}
        className="flex gap-2 overflow-x-auto rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-1"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition",
              activeTab === tab.id
                ? "bg-[color:var(--brand-1)] text-white"
                : "text-neutral-600 hover:bg-[color:var(--surface-accent)]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "description" ? (
          <div className="space-y-3">
            <p className="pretty-text text-sm leading-7 text-neutral-700">{product.longDescription}</p>
            {product.bestFor.length > 0 ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Who is this for?
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.bestFor.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-3 py-1.5 text-xs font-medium text-neutral-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {activeTab === "ingredients" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Ingredients
              </p>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                {product.ingredients.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Allergens
              </p>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                {product.allergens.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {activeTab === "nutrition" ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {nutrition.map((entry) => (
              <div
                key={entry.label}
                className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-3"
              >
                <p className="text-xs text-neutral-500">{entry.label}</p>
                <p className="text-sm font-semibold text-neutral-900">{entry.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "storage" ? (
          <div className="space-y-4">
            {product.shelfLife ? (
              <div className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--bg-accent-gold)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Freshness
                </p>
                <p className="mt-2 text-lg font-semibold text-neutral-900">{product.shelfLife}</p>
              </div>
            ) : null}
            <ul className="space-y-2 text-sm text-neutral-700">
              {(product.storageInstructions ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
