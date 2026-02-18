export const CORE_WEB_VITAL_BUDGETS = {
  LCP: 2500,
  INP: 200,
  CLS: 0.1,
} as const;

export type CoreWebVitalName = keyof typeof CORE_WEB_VITAL_BUDGETS;

export function isCoreWebVitalName(value: string): value is CoreWebVitalName {
  return value === "LCP" || value === "INP" || value === "CLS";
}

export function evaluateCoreWebVital(name: string, value: number) {
  if (!isCoreWebVitalName(name)) {
    return "untracked";
  }
  return value <= CORE_WEB_VITAL_BUDGETS[name] ? "within_budget" : "over_budget";
}
