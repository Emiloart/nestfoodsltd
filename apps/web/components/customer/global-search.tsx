"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useDeferredValue, useEffect, useMemo, useState } from "react";

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
  const deferredQuery = useDeferredValue(query.trim());

  useEffect(() => {
    if (deferredQuery.length < 2) {
      return;
    }

    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      const response = await fetch(`/api/customer/search?q=${encodeURIComponent(deferredQuery)}`);
      if (cancelled) {
        return;
      }
      if (!response.ok) {
        setSuggestions([]);
        setLoading(false);
        return;
      }
      const data = (await response.json()) as SearchResponse;
      if (cancelled) {
        return;
      }
      setSuggestions(data.suggestions);
      setLoading(false);
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [deferredQuery]);

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
    <div className="relative hidden min-w-72 xl:block">
      <form onSubmit={onSubmit}>
        <Input
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            if (nextQuery.trim().length < 2) {
              setSuggestions([]);
              setLoading(false);
              return;
            }
            setLoading(true);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          placeholder="Search products, categories, recipes..."
          className="h-10 rounded-full pl-10"
          aria-label="Search products"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showResults}
          aria-controls={resultsId}
        />
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M16 16l4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </form>

      {showResults ? (
        <div
          id={resultsId}
          role="listbox"
          className="section-frame absolute z-50 mt-3 w-full p-2"
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
                  className="block rounded-[1rem] px-3 py-2.5 transition hover:bg-[color:var(--surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
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
