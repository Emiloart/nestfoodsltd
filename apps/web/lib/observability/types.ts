export type WebVitalMetricName = "LCP" | "INP" | "CLS";

export type ObservabilityWebVitalEvent = {
  id: string;
  metricId: string;
  metricName: WebVitalMetricName;
  value: number;
  status: "within_budget" | "over_budget" | "untracked";
  rating?: string;
  navigationType?: string;
  route?: string;
  ipAddress?: string;
  userAgent?: string;
  observedAt: string;
};

export type ObservabilityErrorEvent = {
  id: string;
  source: "client" | "server";
  severity: "info" | "warning" | "critical";
  message: string;
  route?: string;
  stack?: string;
  fingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  occurredAt: string;
};

export type ObservabilityData = {
  webVitals: ObservabilityWebVitalEvent[];
  errors: ObservabilityErrorEvent[];
};

export type ObservabilitySummary = {
  generatedAt: string;
  windowHours: number;
  webVitals: {
    total: number;
    overBudget: number;
    byMetric: Record<WebVitalMetricName, { total: number; overBudget: number }>;
    recent: ObservabilityWebVitalEvent[];
  };
  errors: {
    total: number;
    critical: number;
    bySource: Record<"client" | "server", number>;
    recent: ObservabilityErrorEvent[];
  };
};
