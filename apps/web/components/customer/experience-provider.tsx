"use client";

import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

import { formatCurrency } from "@/lib/commerce/format";
import { type CurrencyCode } from "@/lib/commerce/types";
import {
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  convertMinorCurrency,
  isSupportedCurrency,
  isSupportedLocale,
} from "@/lib/intl/config";
import { type LocaleCode } from "@/lib/customer/types";

const LOCALE_STORAGE_KEY = "nestfoodsltd_locale";
const CURRENCY_STORAGE_KEY = "nestfoodsltd_currency";

function readInitialLocale() {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return storedLocale && isSupportedLocale(storedLocale) ? storedLocale : DEFAULT_LOCALE;
}

function readInitialCurrency() {
  if (typeof window === "undefined") {
    return DEFAULT_CURRENCY;
  }

  const storedCurrency = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
  return storedCurrency && isSupportedCurrency(storedCurrency)
    ? storedCurrency
    : DEFAULT_CURRENCY;
}

type ExperienceContextValue = {
  locale: LocaleCode;
  currency: CurrencyCode;
  setLocale: (nextLocale: LocaleCode) => void;
  setCurrency: (nextCurrency: CurrencyCode) => void;
  convertMinorAmount: (amountMinor: number, sourceCurrency: CurrencyCode) => number;
  formatMinorAmount: (amountMinor: number, sourceCurrency: CurrencyCode) => string;
};

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

export function ExperienceProvider({ children }: PropsWithChildren) {
  const [locale, setLocale] = useState<LocaleCode>(readInitialLocale);
  const [currency, setCurrency] = useState<CurrencyCode>(readInitialCurrency);

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale.split("-")[0] ?? "en";
    document.cookie = `nest_locale=${locale}; path=/; max-age=31536000; samesite=lax`;
  }, [locale]);

  useEffect(() => {
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    document.cookie = `nest_currency=${currency}; path=/; max-age=31536000; samesite=lax`;
  }, [currency]);

  const value = useMemo<ExperienceContextValue>(() => {
    const convertMinorAmount = (amountMinor: number, sourceCurrency: CurrencyCode) =>
      convertMinorCurrency(amountMinor, sourceCurrency, currency);

    const formatMinorAmount = (amountMinor: number, sourceCurrency: CurrencyCode) =>
      formatCurrency(currency, convertMinorAmount(amountMinor, sourceCurrency), { locale });

    return {
      locale,
      currency,
      setLocale,
      setCurrency,
      convertMinorAmount,
      formatMinorAmount,
    };
  }, [currency, locale]);

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience() {
  const context = useContext(ExperienceContext);
  if (!context) {
    throw new Error("useExperience must be used within ExperienceProvider.");
  }
  return context;
}
