import { getPool } from "@/lib/storage/postgres-json";

import {
  type ObservabilityErrorEvent,
  type ObservabilitySummary,
  type WebVitalMetricName,
} from "./types";

const WEB_VITALS_TABLE = "observability_web_vitals";
const ERRORS_TABLE = "observability_errors";
const MAX_RECENT_ENTRIES = 100;

let schemaEnsured: Promise<void> | null = null;

/**
 * Tables are created by a one-time migration (see repo history), but this
 * keeps local/dev environments and fresh databases working without a
 * manual migration step.
 */
async function ensureSchema() {
  if (schemaEnsured) {
    return schemaEnsured;
  }

  schemaEnsured = (async () => {
    const pool = await getPool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${WEB_VITALS_TABLE} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        metric_id TEXT NOT NULL,
        metric_name TEXT NOT NULL,
        value DOUBLE PRECISION NOT NULL,
        status TEXT NOT NULL,
        rating TEXT,
        navigation_type TEXT,
        route TEXT,
        ip_address TEXT,
        user_agent TEXT,
        observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_observability_web_vitals_observed_at ON ${WEB_VITALS_TABLE} (observed_at DESC);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_observability_web_vitals_metric_name ON ${WEB_VITALS_TABLE} (metric_name);`,
    );
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${ERRORS_TABLE} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source TEXT NOT NULL,
        severity TEXT NOT NULL,
        message TEXT NOT NULL,
        route TEXT,
        stack TEXT,
        fingerprint TEXT,
        ip_address TEXT,
        user_agent TEXT,
        occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_observability_errors_occurred_at ON ${ERRORS_TABLE} (occurred_at DESC);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_observability_errors_severity ON ${ERRORS_TABLE} (severity);`,
    );
  })();

  return schemaEnsured;
}

/** Single-row insert. No read of prior history -- this is the fix. */
export async function insertWebVitalEvent(input: {
  metricId: string;
  metricName: WebVitalMetricName;
  value: number;
  status: "within_budget" | "over_budget" | "untracked";
  rating?: string;
  navigationType?: string;
  route?: string;
  ipAddress?: string;
  userAgent?: string;
  observedAt?: string;
}) {
  await ensureSchema();
  const pool = await getPool();
  await pool.query(
    `INSERT INTO ${WEB_VITALS_TABLE}
      (metric_id, metric_name, value, status, rating, navigation_type, route, ip_address, user_agent, observed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, NOW()))`,
    [
      input.metricId,
      input.metricName,
      input.value,
      input.status,
      input.rating ?? null,
      input.navigationType ?? null,
      input.route ?? null,
      input.ipAddress ?? null,
      input.userAgent ?? null,
      input.observedAt ?? null,
    ],
  );
}

/** Single-row insert. No read of prior history -- this is the fix. */
export async function insertErrorEvent(input: {
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
  await ensureSchema();
  const pool = await getPool();
  await pool.query(
    `INSERT INTO ${ERRORS_TABLE}
      (source, severity, message, route, stack, fingerprint, ip_address, user_agent, occurred_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, NOW()))`,
    [
      input.source,
      input.severity,
      input.message,
      input.route ?? null,
      input.stack ?? null,
      input.fingerprint ?? null,
      input.ipAddress ?? null,
      input.userAgent ?? null,
      input.occurredAt ?? null,
    ],
  );
}

function toWebVitalEvent(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    metricId: row.metric_id as string,
    metricName: row.metric_name as WebVitalMetricName,
    value: Number(row.value),
    status: row.status as "within_budget" | "over_budget" | "untracked",
    rating: (row.rating as string | null) ?? undefined,
    navigationType: (row.navigation_type as string | null) ?? undefined,
    route: (row.route as string | null) ?? undefined,
    ipAddress: (row.ip_address as string | null) ?? undefined,
    userAgent: (row.user_agent as string | null) ?? undefined,
    observedAt: (row.observed_at as Date).toISOString(),
  };
}

function toErrorEvent(row: Record<string, unknown>): ObservabilityErrorEvent {
  return {
    id: row.id as string,
    source: row.source as "client" | "server",
    severity: row.severity as "info" | "warning" | "critical",
    message: row.message as string,
    route: (row.route as string | null) ?? undefined,
    stack: (row.stack as string | null) ?? undefined,
    fingerprint: (row.fingerprint as string | null) ?? undefined,
    ipAddress: (row.ip_address as string | null) ?? undefined,
    userAgent: (row.user_agent as string | null) ?? undefined,
    occurredAt: (row.occurred_at as Date).toISOString(),
  };
}

/**
 * Summary built from SQL aggregates (COUNT/GROUP BY) over a bounded time
 * window, instead of loading the full event history into the Node process
 * on every admin dashboard view.
 */
export async function queryObservabilitySummary(windowHours: number): Promise<ObservabilitySummary> {
  await ensureSchema();
  const pool = await getPool();

  const [webVitalTotals, webVitalByMetric, recentWebVitals, errorTotals, errorBySource, recentErrors] =
    await Promise.all([
      pool.query<{ total: string; over_budget: string }>(
        `SELECT count(*) AS total, count(*) FILTER (WHERE status = 'over_budget') AS over_budget
         FROM ${WEB_VITALS_TABLE} WHERE observed_at >= NOW() - ($1 || ' hours')::interval`,
        [windowHours],
      ),
      pool.query<{ metric_name: string; total: string; over_budget: string }>(
        `SELECT metric_name, count(*) AS total, count(*) FILTER (WHERE status = 'over_budget') AS over_budget
         FROM ${WEB_VITALS_TABLE} WHERE observed_at >= NOW() - ($1 || ' hours')::interval
         GROUP BY metric_name`,
        [windowHours],
      ),
      pool.query(
        `SELECT * FROM ${WEB_VITALS_TABLE} WHERE observed_at >= NOW() - ($1 || ' hours')::interval
         ORDER BY observed_at DESC LIMIT ${MAX_RECENT_ENTRIES}`,
        [windowHours],
      ),
      pool.query<{ total: string; critical: string }>(
        `SELECT count(*) AS total, count(*) FILTER (WHERE severity = 'critical') AS critical
         FROM ${ERRORS_TABLE} WHERE occurred_at >= NOW() - ($1 || ' hours')::interval`,
        [windowHours],
      ),
      pool.query<{ source: string; total: string }>(
        `SELECT source, count(*) AS total FROM ${ERRORS_TABLE}
         WHERE occurred_at >= NOW() - ($1 || ' hours')::interval GROUP BY source`,
        [windowHours],
      ),
      pool.query(
        `SELECT * FROM ${ERRORS_TABLE} WHERE occurred_at >= NOW() - ($1 || ' hours')::interval
         ORDER BY occurred_at DESC LIMIT ${MAX_RECENT_ENTRIES}`,
        [windowHours],
      ),
    ]);

  const byMetric: Record<WebVitalMetricName, { total: number; overBudget: number }> = {
    LCP: { total: 0, overBudget: 0 },
    INP: { total: 0, overBudget: 0 },
    CLS: { total: 0, overBudget: 0 },
  };
  for (const row of webVitalByMetric.rows) {
    if (row.metric_name in byMetric) {
      byMetric[row.metric_name as WebVitalMetricName] = {
        total: Number(row.total),
        overBudget: Number(row.over_budget),
      };
    }
  }

  const bySource: Record<"client" | "server", number> = { client: 0, server: 0 };
  for (const row of errorBySource.rows) {
    if (row.source === "client" || row.source === "server") {
      bySource[row.source] = Number(row.total);
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    windowHours,
    webVitals: {
      total: Number(webVitalTotals.rows[0]?.total ?? 0),
      overBudget: Number(webVitalTotals.rows[0]?.over_budget ?? 0),
      byMetric,
      recent: recentWebVitals.rows.map(toWebVitalEvent),
    },
    errors: {
      total: Number(errorTotals.rows[0]?.total ?? 0),
      critical: Number(errorTotals.rows[0]?.critical ?? 0),
      bySource,
      recent: recentErrors.rows.map(toErrorEvent),
    },
  };
}
