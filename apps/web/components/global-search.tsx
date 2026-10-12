"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useDeferredValue, useEffect, useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

type SearchSuggestion = {
  id: string;
  type: "product" | "category";
  title: string;
  subtitle?: string;
  href: string;
};

export function GlobalSearch() {
  const router = useRouter();
  const resultsId = useId();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [active, setActive] = useState(-1);
  const deferredQuery = useDeferredValue(query.trim());
  useEffect(() => {
    if (deferredQuery.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(deferredQuery)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Search unavailable");
        const data = (await response.json()) as { suggestions: SearchSuggestion[] };
        if (!controller.signal.aborted) {
          setSuggestions(data.suggestions);
          setError(false);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [deferredQuery]);
  const showResults = focused && query.trim().length >= 2;
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const suggestion = suggestions[active];
    if (!query.trim()) return;
    router.push(suggestion?.href ?? `/products?search=${encodeURIComponent(query.trim())}`);
    setFocused(false);
  }
  return (
    <div
      className="relative hidden min-w-72 lg:block"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <form onSubmit={onSubmit}>
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(-1);
            setSuggestions([]);
            setError(false);
            setLoading(event.target.value.trim().length >= 2);
            setFocused(true);
          }}
          onFocus={() => setFocused(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setFocused(false);
              setActive(-1);
            } else if (
              (event.key === "ArrowDown" || event.key === "ArrowUp") &&
              suggestions.length
            ) {
              event.preventDefault();
              setFocused(true);
              setActive((current) =>
                event.key === "ArrowDown"
                  ? (current + 1) % suggestions.length
                  : (current - 1 + suggestions.length) % suggestions.length,
              );
            }
          }}
          placeholder="Search products, ingredients or sizes"
          className="header-search rounded-full"
          aria-label="Search De-Nest Bread products and product information"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showResults}
          aria-controls={showResults ? resultsId : undefined}
          aria-activedescendant={showResults && active >= 0 ? `${resultsId}-${active}` : undefined}
        />
      </form>
      {showResults ? (
        <div className="section-frame absolute z-50 mt-3 w-full p-2">
          <ul
            id={resultsId}
            role="listbox"
            aria-label="Product search results"
            className="space-y-1"
          >
            {!loading &&
              suggestions.map((entry, index) => (
                <li
                  key={entry.id}
                  id={`${resultsId}-${index}`}
                  role="option"
                  aria-selected={active === index}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseMove={() => setActive(index)}
                  onClick={() => {
                    router.push(entry.href);
                    setFocused(false);
                  }}
                  className={cn(
                    "min-h-11 cursor-pointer rounded-xl px-3 py-3 text-neutral-900",
                    active === index && "bg-[color:var(--surface-strong)]",
                  )}
                >
                  <p className="text-sm font-semibold">{entry.title}</p>
                  <p className="mt-1 text-xs text-neutral-700">{entry.subtitle ?? entry.type}</p>
                </li>
              ))}
          </ul>
          {loading || error || !suggestions.length ? (
            <p role="status" className="px-3 py-3 text-sm text-neutral-700">
              {loading
                ? "Searching…"
                : error
                  ? "Suggestions are unavailable. Press Enter to search the catalogue."
                  : "No suggestions. Press Enter to search the catalogue."}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
