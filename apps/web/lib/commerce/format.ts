import { type CurrencyCode } from "./types";

export function formatCurrency(currency: CurrencyCode, amountMinor: number, options?: { locale?: string }) {
  return new Intl.NumberFormat(options?.locale ?? "en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}
