"use client";

import { SUPPORTED_CURRENCIES, SUPPORTED_LOCALES } from "@/lib/intl/config";

import { useExperience } from "./experience-provider";

export function LocaleCurrencySwitcher() {
  const { locale, currency, setLocale, setCurrency } = useExperience();

  return (
    <div className="hidden items-center gap-2 xl:flex">
      <label className="sr-only" htmlFor="locale-switcher">
        Locale
      </label>
      <select
        id="locale-switcher"
        value={locale}
        onChange={(event) => setLocale(event.target.value as typeof locale)}
        className="h-9 rounded-full border border-neutral-300 bg-white px-3 text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200"
        aria-label="Select locale"
      >
        {SUPPORTED_LOCALES.map((entry) => (
          <option key={entry.code} value={entry.code}>
            {entry.label}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="currency-switcher">
        Currency
      </label>
      <select
        id="currency-switcher"
        value={currency}
        onChange={(event) => setCurrency(event.target.value as typeof currency)}
        className="h-9 rounded-full border border-neutral-300 bg-white px-3 text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200"
        aria-label="Select currency"
      >
        {SUPPORTED_CURRENCIES.map((entry) => (
          <option key={entry} value={entry}>
            {entry}
          </option>
        ))}
      </select>
    </div>
  );
}
