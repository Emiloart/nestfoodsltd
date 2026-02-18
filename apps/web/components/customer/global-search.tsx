"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";

type SearchSuggestion = {
  id: string;
  type: "product" | "category" | "recipe";
  title: string;
  subtitle?: string;
  href: string;
};

type SearchResponse = {
  suggestions: SearchSuggestion[];
};

export function GlobalSearch() {
  const router = useRouter();
  const resultsId = "global-search-results";
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeoutId = window.setTimeout(async () => {
      const response = await fetch(`/api/customer/search?q=${encodeURIComponent(normalized)}`);
      if (!response.ok) {
        setLoading(false);
        return;
      }
      const data = (await response.json()) as SearchResponse;
      setSuggestions(data.suggestions);
      setLoading(false);
    }, 200);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const showResults = useMemo(
    () => focused && (loading || suggestions.length > 0),
    [focused, loading, suggestions.length],
  );

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = query.trim();
    if (!normalized) {
      return;
    }
    router.push(`/shop?search=${encodeURIComponent(normalized)}`);
    setFocused(false);
  }

  return (
    <div className="relative hidden min-w-72 lg:block">
      <form onSubmit={onSubmit}>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          placeholder="Search products, categories, recipes..."
          className="pl-10"
          aria-label="Search products"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showResults}
          aria-controls={resultsId}
        />
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
        />
      </form>

      {showResults ? (
        <div
          id={resultsId}
          role="listbox"
          className="absolute z-50 mt-2 w-full rounded-2xl border border-neutral-200 bg-white p-2 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
        >
          {loading ? (
            <p role="status" className="px-2 py-2 text-xs text-neutral-500 dark:text-neutral-400">
              Searching...
            </p>
          ) : (
            <div className="space-y-1">
              {suggestions.map((entry) => (
                <Link
                  key={entry.id}
                  href={entry.href}
                  role="option"
                  aria-selected="false"
                  className="block rounded-xl px-2 py-2 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:hover:bg-neutral-900"
                >
                  <p className="text-sm text-neutral-900 dark:text-neutral-100">{entry.title}</p>
                  <p className="text-xs uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                    {entry.subtitle ?? entry.type}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
