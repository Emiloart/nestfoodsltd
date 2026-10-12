"use client";

import { useDeferredValue, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

import { ProductEditorialCard } from "@/components/products/product-editorial-card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { type CatalogueProduct } from "@/lib/catalog/types";

type ProductsCatalogueClientProps = {
  products: CatalogueProduct[];
  initialCategory?: string;
  initialSearch?: string;
};

type SortMode = "featured" | "name" | "size";

const sortOptions: { value: SortMode; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "name", label: "Name A-Z" },
  { value: "size", label: "Size" },
];

function parsePackSize(product: CatalogueProduct) {
  const text = product.packFormats
    .map((format) => format.label)
    .join(" ")
    .toLowerCase();
  const match = text.match(/(\d+(?:\.\d+)?)\s*(kg|g)/);
  if (!match) {
    if (product.slug.includes("sliced") || product.slug.includes("family-loaf")) {
      return 1000;
    }
    return 0;
  }

  const value = Number(match[1]);
  return match[2] === "kg" ? value * 1000 : value;
}

export function ProductsCatalogueClient({ products }: ProductsCatalogueClientProps) {
  const params = useSearchParams();
  const pathname = usePathname();
  const categoryOptions = ["All", ...new Set(products.map((product) => product.category))];
  const requestedCategory = params.get("category");
  const category =
    requestedCategory && categoryOptions.includes(requestedCategory) ? requestedCategory : "All";
  const requestedSort = params.get("sort");
  const sortMode: SortMode =
    requestedSort === "name" || requestedSort === "size" ? requestedSort : "featured";
  const search = params.get("search") ?? "";
  function updateFilter(key: string, value: string, push = false) {
    const next = new URLSearchParams(params);
    if (value && value !== "All" && value !== "featured") next.set(key, value);
    else next.delete(key);
    const url = `${pathname}${next.size ? `?${next}` : ""}${window.location.hash}`;
    if (push) window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  }
  function clearFilters() {
    window.history.pushState(null, "", `${pathname}${window.location.hash}`);
  }
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const categoryMatches = category === "All" || product.category === category;
      if (!categoryMatches) {
        return false;
      }

      if (!deferredSearch) {
        return true;
      }

      const haystack = [
        product.name,
        product.category,
        product.shortDescription,
        product.longDescription,
        product.ingredients.join(" "),
        product.allergens.join(" "),
        product.bestFor.join(" "),
        product.packFormats.map((format) => format.label).join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(deferredSearch);
    });

    if (sortMode === "name") {
      return [...filtered].sort((left, right) => left.name.localeCompare(right.name));
    }

    if (sortMode === "size") {
      return [...filtered].sort((left, right) => parsePackSize(right) - parsePackSize(left));
    }

    return filtered;
  }, [category, deferredSearch, products, sortMode]);

  return (
    <div className="space-y-6">
      <div className="section-frame space-y-4 px-4 py-4 sm:px-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-neutral-700">Search catalogue</span>
            <Input
              value={search}
              id="catalogue-search"
              type="search"
              className="scroll-mt-32"
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search products, ingredients, or pack sizes..."
            />
          </label>

          <div className="block space-y-2">
            <label
              htmlFor="catalogue-sort"
              className="block text-sm font-semibold text-neutral-700"
            >
              Sort
            </label>
            <select
              id="catalogue-sort"
              value={sortMode}
              onChange={(event) => updateFilter("sort", event.target.value, true)}
              className="field-control h-11 min-w-44 px-3 text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div aria-label="Product categories" className="flex flex-wrap gap-2">
          {categoryOptions.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={category === option}
              onClick={() => updateFilter("category", option, true)}
              className={cn(
                "min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition",
                category === option
                  ? "border-[color:var(--brand-1)] bg-[color:var(--brand-1)] text-white"
                  : "border-[color:var(--border)] bg-white text-neutral-600 hover:border-[color:var(--brand-1)] hover:text-[color:var(--brand-1)]",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-700">
        <span role="status">{visibleProducts.length} products shown</span>
        {category !== "All" || search || sortMode !== "featured" ? (
          <Button variant="secondary" onClick={clearFilters}>
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {visibleProducts.map((product) => (
          <ProductEditorialCard key={product.id} product={product} />
        ))}
      </div>

      {visibleProducts.length === 0 ? (
        <div className="section-frame px-5 py-6">
          <p className="text-sm text-neutral-600">
            No products matched the current filter. Try another product range or search term.
          </p>
        </div>
      ) : null}
    </div>
  );
}
