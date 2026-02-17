import { type CurrencyCode } from "@/lib/commerce/types";
import { type LocaleCode } from "@/lib/customer/types";

export const SUPPORTED_LOCALES: { code: LocaleCode; label: string }[] = [
  { code: "en-NG", label: "English (Nigeria)" },
  { code: "ha-NG", label: "Hausa" },
  { code: "yo-NG", label: "Yoruba" },
  { code: "ig-NG", label: "Igbo" },
  { code: "fr-FR", label: "Français" },
];

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ["NGN", "USD"];

export const DEFAULT_LOCALE: LocaleCode = "en-NG";
export const DEFAULT_CURRENCY: CurrencyCode = "NGN";

const currencyToNgnMajorRate: Record<CurrencyCode, number> = {
  NGN: 1,
  USD: 1600,
};

export function isSupportedLocale(value: string): value is LocaleCode {
  return SUPPORTED_LOCALES.some((entry) => entry.code === value);
}

export function isSupportedCurrency(value: string): value is CurrencyCode {
  return SUPPORTED_CURRENCIES.includes(value as CurrencyCode);
}

export function convertMinorCurrency(amountMinor: number, from: CurrencyCode, to: CurrencyCode) {
  if (from === to) {
    return amountMinor;
  }

  const fromMajor = amountMinor / 100;
  const ngnMajor = fromMajor * currencyToNgnMajorRate[from];
  const toMajor = ngnMajor / currencyToNgnMajorRate[to];
  return Math.round(toMajor * 100);
}
