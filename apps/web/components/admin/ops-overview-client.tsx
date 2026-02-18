"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type ObservabilitySummary } from "@/lib/observability/types";

type OpsSummaryResponse = {
  role: string;
  summary: ObservabilitySummary;
  runtime: {
    nodeEnv: string;
    uptimeSeconds: number;
    generatedAt: string;
  };
};

const windowOptions = [24, 72, 168];

function formatMetricValue(metricName: "LCP" | "INP" | "CLS", value: number) {
  if (metricName === "CLS") {
    return value.toFixed(3);
  }
  return Math.round(value).toString();
}

export function OpsOverviewClient() {
  const [windowHours, setWindowHours] = useState(24);
  const [summary, setSummary] = useState<OpsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Loading observability summary...");

  async function loadSummary(nextWindowHours = windowHours) {
    setLoading(true);
    const params = new URLSearchParams({ windowHours: String(nextWindowHours) });
    const response = await fetch(`/api/admin/ops/summary?${params.toString()}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(errorBody?.error ?? "Failed to load operations summary.");
      setLoading(false);
      return;
    }

    const data = (await response.json()) as OpsSummaryResponse;
    setSummary(data);
    setStatus(
      `Loaded ${data.summary.webVitals.total} web-vitals and ${data.summary.errors.total} errors for ${data.summary.windowHours}h.`,
    );
    setLoading(false);
  }

  useEffect(() => {
    void loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const vitalRows = summary?.summary.webVitals.recent ?? [];
  const errorRows = summary?.summary.errors.recent ?? [];
  const runtime = summary?.runtime;

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-2">
        <Badge>Operations</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Observability Dashboard
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Runtime health, Core Web Vitals budget performance, and captured application errors.
        </p>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {windowOptions.map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => {
                setWindowHours(entry);
                void loadSummary(entry);
              }}
              className={`h-9 rounded-full px-4 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                windowHours === entry
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
              }`}
            >
              {entry}h
            </button>
          ))}
          <Button onClick={() => loadSummary()} disabled={loading} className="ml-auto">
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Card className="space-y-1">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Web Vitals</p>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {summary?.summary.webVitals.total ?? 0}
            </p>
          </Card>
          <Card className="space-y-1">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Over Budget</p>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {summary?.summary.webVitals.overBudget ?? 0}
            </p>
          </Card>
          <Card className="space-y-1">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Errors</p>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {summary?.summary.errors.total ?? 0}
            </p>
          </Card>
          <Card className="space-y-1">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Critical Errors</p>
            <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {summary?.summary.errors.critical ?? 0}
            </p>
          </Card>
        </div>

        {runtime ? (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Runtime: {runtime.nodeEnv} · uptime {runtime.uptimeSeconds}s · generated{" "}
            {new Date(runtime.generatedAt).toLocaleString("en-NG")}
          </p>
        ) : null}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Recent Web Vitals
          </p>
          {vitalRows.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              No web-vitals events in selected window.
            </p>
          ) : (
            vitalRows.slice(0, 12).map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {entry.metricName}: {formatMetricValue(entry.metricName, entry.value)}
                  </p>
                  <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                    {entry.status}
                  </p>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {entry.route ?? "/"} · {new Date(entry.observedAt).toLocaleString("en-NG")}
                </p>
              </div>
            ))
          )}
        </Card>

        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Recent Errors
          </p>
          {errorRows.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              No captured errors in selected window.
            </p>
          ) : (
            errorRows.slice(0, 12).map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {entry.message}
                  </p>
                  <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                    {entry.severity} · {entry.source}
                  </p>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {entry.route ?? "/"} · {new Date(entry.occurredAt).toLocaleString("en-NG")}
                </p>
              </div>
            ))
          )}
        </Card>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
    </section>
  );
}
