"use client";

import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";

import { evaluateCoreWebVital, isCoreWebVitalName } from "@/lib/performance/core-web-vitals";

type WebVitalsMetric = {
  id: string;
  name: string;
  value: number;
  rating?: string;
  navigationType?: string;
};

export function WebVitalsReporter() {
  const pathname = usePathname();

  useReportWebVitals((metric: WebVitalsMetric) => {
    if (!isCoreWebVitalName(metric.name)) {
      return;
    }

    const status = evaluateCoreWebVital(metric.name, metric.value);
    if (status === "over_budget" && process.env.NODE_ENV !== "production") {
      console.warn(`[web-vitals] ${metric.name} over budget: ${metric.value}`);
    }

    void fetch("/api/telemetry/web-vitals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        id: metric.id,
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        navigationType: metric.navigationType,
        route: pathname,
      }),
    }).catch(() => undefined);
  });

  return null;
}
