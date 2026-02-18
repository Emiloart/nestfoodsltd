import { unstable_noStore as noStore } from "next/cache";

import { readAuditData, writeAuditData } from "./store";
import { type AuditEvent } from "./types";

const MAX_AUDIT_EVENTS = 5000;

function normalizeDetails(
  input?: Record<string, unknown> | null,
): Record<string, string | number | boolean | null> | undefined {
  if (!input) {
    return undefined;
  }

  const output: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(input)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      output[key] = value;
    }
  }

  return Object.keys(output).length > 0 ? output : undefined;
}

export async function logAuditEvent(
  input: Omit<AuditEvent, "id" | "occurredAt" | "details"> & {
    occurredAt?: string;
    details?: Record<string, unknown> | null;
  },
) {
  const data = await readAuditData();
  const event: AuditEvent = {
    id: crypto.randomUUID(),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    actorType: input.actorType,
    actorId: input.actorId?.trim() || undefined,
    actorRole: input.actorRole?.trim() || undefined,
    action: input.action.trim(),
    resourceType: input.resourceType?.trim() || undefined,
    resourceId: input.resourceId?.trim() || undefined,
    outcome: input.outcome,
    severity: input.severity,
    ipAddress: input.ipAddress?.trim() || undefined,
    userAgent: input.userAgent?.trim() || undefined,
    details: normalizeDetails(input.details),
  };

  data.events.unshift(event);
  if (data.events.length > MAX_AUDIT_EVENTS) {
    data.events = data.events.slice(0, MAX_AUDIT_EVENTS);
  }
  await writeAuditData(data);
  return event;
}

export async function listAuditEvents(filters?: {
  action?: string;
  outcome?: "success" | "failure" | "blocked";
  actorType?: "admin" | "customer" | "b2b" | "system" | "anonymous";
  severity?: "info" | "warning" | "critical";
  search?: string;
  limit?: number;
}) {
  noStore();
  const data = await readAuditData();
  let events = [...data.events];

  if (filters?.action) {
    events = events.filter((entry) => entry.action === filters.action);
  }
  if (filters?.outcome) {
    events = events.filter((entry) => entry.outcome === filters.outcome);
  }
  if (filters?.actorType) {
    events = events.filter((entry) => entry.actorType === filters.actorType);
  }
  if (filters?.severity) {
    events = events.filter((entry) => entry.severity === filters.severity);
  }
  if (filters?.search?.trim()) {
    const query = filters.search.trim().toLowerCase();
    events = events.filter((entry) => {
      const haystack = [
        entry.action,
        entry.actorId ?? "",
        entry.actorRole ?? "",
        entry.resourceType ?? "",
        entry.resourceId ?? "",
        entry.ipAddress ?? "",
        JSON.stringify(entry.details ?? {}),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  const limit = Math.min(Math.max(filters?.limit ?? 100, 1), 500);
  return events.slice(0, limit);
}
