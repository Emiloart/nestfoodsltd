import { unstable_noStore as noStore } from "next/cache";

import { readObservabilityData, writeObservabilityData } from "./store";
import {
  type ObservabilityErrorEvent,
  type ObservabilitySummary,
  type ObservabilityWebVitalEvent,
} from "./types";

const MAX_WEB_VITAL_EVENTS = 5000;
const MAX_ERROR_EVENTS = 3000;
const MAX_RECENT_ENTRIES = 100;

function normalizeString(input?: string | null) {
  const value = input?.trim();
  return value ? value : undefined;
}

function normalizeRoute(input?: string | null) {
  const route = normalizeString(input);
  if (!route) {
    return undefined;
  }
  return route.startsWith("/") ? route : `/${route}`;
}

function normalizeNumber(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return value;
}

function normalizeStatus(
  input: "within_budget" | "over_budget" | "untracked" | string,
): "within_budget" | "over_budget" | "untracked" {
  if (input === "within_budget" || input === "over_budget" || input === "untracked") {
    return input;
  }
  return "untracked";
}

function withinTimeWindow(isoDate: string, windowHours: number) {
  const timestamp = new Date(isoDate).getTime();
  if (!Number.isFinite(timestamp)) {
    return false;
  }
  const lowerBound = Date.now() - windowHours * 60 * 60 * 1000;
  return timestamp >= lowerBound;
}

export async function recordWebVitalEvent(input: {
  metricId: string;
  metricName: "LCP" | "INP" | "CLS";
  value: number;
  status: "within_budget" | "over_budget" | "untracked";
  rating?: string;
  navigationType?: string;
  route?: string;
  ipAddress?: string;
  userAgent?: string;
  observedAt?: string;
}) {
  const data = await readObservabilityData();
  const event: ObservabilityWebVitalEvent = {
    id: crypto.randomUUID(),
    metricId: input.metricId,
    metricName: input.metricName,
    value: normalizeNumber(input.value),
    status: normalizeStatus(input.status),
    rating: normalizeString(input.rating),
    navigationType: normalizeString(input.navigationType),
    route: normalizeRoute(input.route),
    ipAddress: normalizeString(input.ipAddress),
    userAgent: normalizeString(input.userAgent),
    observedAt: input.observedAt ?? new Date().toISOString(),
  };

  data.webVitals.unshift(event);
  if (data.webVitals.length > MAX_WEB_VITAL_EVENTS) {
    data.webVitals = data.webVitals.slice(0, MAX_WEB_VITAL_EVENTS);
  }
  await writeObservabilityData(data);
  return event;
}

export async function recordErrorEvent(input: {
  source: "client" | "server";
  severity: "info" | "warning" | "critical";
  message: string;
  route?: string;
  stack?: string;
  fingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  occurredAt?: string;
}) {
  const data = await readObservabilityData();
  const event: ObservabilityErrorEvent = {
    id: crypto.randomUUID(),
    source: input.source,
    severity: input.severity,
    message: input.message.trim(),
    route: normalizeRoute(input.route),
    stack: normalizeString(input.stack),
    fingerprint: normalizeString(input.fingerprint),
    ipAddress: normalizeString(input.ipAddress),
    userAgent: normalizeString(input.userAgent),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  };

  data.errors.unshift(event);
  if (data.errors.length > MAX_ERROR_EVENTS) {
    data.errors = data.errors.slice(0, MAX_ERROR_EVENTS);
  }
  await writeObservabilityData(data);
  return event;
}

export async function getObservabilitySummary(options?: { windowHours?: number }) {
  noStore();
  const windowHours = Math.min(Math.max(options?.windowHours ?? 24, 1), 24 * 30);
  const data = await readObservabilityData();

  const scopedWebVitals = data.webVitals.filter((entry) =>
    withinTimeWindow(entry.observedAt, windowHours),
  );
  const scopedErrors = data.errors.filter((entry) =>
    withinTimeWindow(entry.occurredAt, windowHours),
  );

  const summary: ObservabilitySummary = {
    generatedAt: new Date().toISOString(),
    windowHours,
    webVitals: {
      total: scopedWebVitals.length,
      overBudget: scopedWebVitals.filter((entry) => entry.status === "over_budget").length,
      byMetric: {
        LCP: {
          total: scopedWebVitals.filter((entry) => entry.metricName === "LCP").length,
          overBudget: scopedWebVitals.filter(
            (entry) => entry.metricName === "LCP" && entry.status === "over_budget",
          ).length,
        },
        INP: {
          total: scopedWebVitals.filter((entry) => entry.metricName === "INP").length,
          overBudget: scopedWebVitals.filter(
            (entry) => entry.metricName === "INP" && entry.status === "over_budget",
          ).length,
        },
        CLS: {
          total: scopedWebVitals.filter((entry) => entry.metricName === "CLS").length,
          overBudget: scopedWebVitals.filter(
            (entry) => entry.metricName === "CLS" && entry.status === "over_budget",
          ).length,
        },
      },
      recent: scopedWebVitals.slice(0, MAX_RECENT_ENTRIES),
    },
    errors: {
      total: scopedErrors.length,
      critical: scopedErrors.filter((entry) => entry.severity === "critical").length,
      bySource: {
        client: scopedErrors.filter((entry) => entry.source === "client").length,
        server: scopedErrors.filter((entry) => entry.source === "server").length,
      },
      recent: scopedErrors.slice(0, MAX_RECENT_ENTRIES),
    },
  };

  return summary;
}
