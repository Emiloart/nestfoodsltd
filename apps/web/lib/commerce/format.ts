import { type CurrencyCode } from "./types";

export function formatCurrency(currency: CurrencyCode, amountMinor: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}
