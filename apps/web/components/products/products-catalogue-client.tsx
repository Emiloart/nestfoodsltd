"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useDeferredValue, useMemo, useState } from "react";

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

const categoryOptions = ["All", "Family Bread", "Sliced Bread", "Mini Bread", "Midi Bread"];

const sortOptions: { value: SortMode; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "name", label: "Name A-Z" },
  { value: "size", label: "Size" },
];

function parsePackSize(product: CatalogueProduct) {
  const text = product.packFormats.map((format) => format.label).join(" ").toLowerCase();
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

export function ProductsCatalogueClient({
  products,
  initialCategory,
  initialSearch,
}: ProductsCatalogueClientProps) {
  const normalizedInitialCategory =
    initialCategory && categoryOptions.includes(initialCategory) ? initialCategory : "All";
  const [category, setCategory] = useState(normalizedInitialCategory);
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [search, setSearch] = useState(initialSearch ?? "");
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
            <span className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">
              Search catalogue
            </span>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products, ingredients, or pack sizes..."
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">
              Sort
            </span>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="field-control h-11 min-w-44 px-3 text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categoryOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCategory(option)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition",
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

      <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
        <span>{visibleProducts.length} products shown</span>
        <span>{category}</span>
      </div>

      <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visibleProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <ProductEditorialCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

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
