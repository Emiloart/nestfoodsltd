"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type AuditEvent } from "@/lib/audit/types";

type AuditResponse = {
  role: string;
  events: AuditEvent[];
};

export function AuditEventsClient() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [search, setSearch] = useState("");
  const [outcome, setOutcome] = useState<"" | "success" | "failure" | "blocked">("");
  const [status, setStatus] = useState("Loading audit events...");
  const [loading, setLoading] = useState(false);

  async function loadEvents(nextSearch = search, nextOutcome = outcome) {
    setLoading(true);
    const params = new URLSearchParams({ limit: "200" });
    if (nextSearch.trim()) {
      params.set("search", nextSearch.trim());
    }
    if (nextOutcome) {
      params.set("outcome", nextOutcome);
    }

    const response = await fetch(`/api/admin/audit/events?${params.toString()}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(errorBody?.error ?? "Failed to load audit events.");
      setLoading(false);
      return;
    }

    const data = (await response.json()) as AuditResponse;
    setEvents(data.events);
    setStatus(`Loaded ${data.events.length} audit events.`);
    setLoading(false);
  }

  useEffect(() => {
    void loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const criticalCount = useMemo(
    () => events.filter((entry) => entry.severity === "critical").length,
    [events],
  );
  const blockedCount = useMemo(
    () => events.filter((entry) => entry.outcome === "blocked").length,
    [events],
  );

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-2">
        <Badge>Security Audit</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Audit Events
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Review admin-sensitive operations, blocked requests, and abuse signals.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="space-y-1">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Events</p>
          <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {events.length}
          </p>
        </Card>
        <Card className="space-y-1">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Blocked</p>
          <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {blockedCount}
          </p>
        </Card>
        <Card className="space-y-1">
          <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Critical</p>
          <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {criticalCount}
          </p>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search action, actor, resource, or IP"
          />
          <select
            value={outcome}
            onChange={(event) =>
              setOutcome(event.target.value as "" | "success" | "failure" | "blocked")
            }
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          >
            <option value="">All outcomes</option>
            <option value="success">success</option>
            <option value="failure">failure</option>
            <option value="blocked">blocked</option>
          </select>
          <Button onClick={() => loadEvents()} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <div className="space-y-2">
          {events.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              No events found for current filters.
            </p>
          ) : (
            events.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {entry.action}
                  </p>
                  <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                    {entry.severity} · {entry.outcome}
                  </p>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {entry.occurredAt} · actor {entry.actorType}
                  {entry.actorRole ? ` (${entry.actorRole})` : ""} ·{" "}
                  {entry.ipAddress ?? "unknown-ip"}
                </p>
                {entry.resourceType || entry.resourceId ? (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Resource: {entry.resourceType ?? "unknown"} · {entry.resourceId ?? "n/a"}
                  </p>
                ) : null}
                {entry.details ? (
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {Object.entries(entry.details)
                      .map(([key, value]) => `${key}=${String(value)}`)
                      .join(" · ")}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </Card>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
    </section>
  );
}
