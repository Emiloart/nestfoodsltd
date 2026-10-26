type PgPool = import("pg").Pool;

const STORAGE_TABLE = "app_json_storage";

function getGlobalCache() {
  const globalObject = globalThis as typeof globalThis & {
    __nestfoodsltdPgPool?: PgPool;
    __nestfoodsltdPgEnsurePromise?: Promise<void>;
  };
  return globalObject;
}

/**
 * pg-connection-string currently treats prefer, require, and verify-ca as
 * verify-full aliases, but warns that a future major version will change
 * those semantics. Normalize the legacy aliases explicitly so upgrades
 * preserve the current certificate and hostname verification guarantees.
 */
function normalizePostgresConnectionString(connectionString: string): string {
  const parsed = new URL(connectionString);
  const sslMode = parsed.searchParams.get("sslmode")?.toLowerCase();

  if (sslMode === "prefer" || sslMode === "require" || sslMode === "verify-ca") {
    parsed.searchParams.set("sslmode", "verify-full");
  }

  return parsed.toString();
}

/**
 * Shared pg Pool, reused by any module that needs direct SQL access (not
 * just the generic JSON blob store below). Modules like observability use
 * this directly for append-only inserts instead of the blob helpers.
 */
export async function getPool(): Promise<PgPool> {
  const cache = getGlobalCache();
  if (cache.__nestfoodsltdPgPool) {
    return cache.__nestfoodsltdPgPool;
  }

  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is required when using postgres storage drivers.");
  }

  const normalizedConnectionString = normalizePostgresConnectionString(connectionString);
  const { Pool } = await import("pg");
  cache.__nestfoodsltdPgPool = new Pool({ connectionString: normalizedConnectionString });
  return cache.__nestfoodsltdPgPool;
}

async function ensureStorageTable() {
  const cache = getGlobalCache();
  if (cache.__nestfoodsltdPgEnsurePromise) {
    return cache.__nestfoodsltdPgEnsurePromise;
  }

  cache.__nestfoodsltdPgEnsurePromise = (async () => {
    const pool = await getPool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${STORAGE_TABLE} (
        module_key TEXT PRIMARY KEY,
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  })();

  return cache.__nestfoodsltdPgEnsurePromise;
}

function cloneValue<T>(value: T): T {
  return structuredClone(value);
}

/**
 * Generic JSON-blob key/value store. Good for small, infrequently-written
 * documents (site content, settings). NOT appropriate for high-frequency
 * event logs (web vitals, error events, audit trails) -- those should use
 * a dedicated append-only table (see lib/observability/sql-store.ts for an
 * example), since this helper always reads and rewrites the entire blob.
 */
export async function readPostgresJsonStore<T>(moduleKey: string, fallback: T): Promise<T> {
  await ensureStorageTable();
  const pool = await getPool();
  const result = await pool.query<{ payload: T }>(
    `SELECT payload FROM ${STORAGE_TABLE} WHERE module_key = $1 LIMIT 1`,
    [moduleKey],
  );

  const record = result.rows[0];
  if (!record) {
    const initialValue = cloneValue(fallback);
    await writePostgresJsonStore(moduleKey, initialValue);
    return initialValue;
  }
  return record.payload;
}

export async function writePostgresJsonStore<T>(moduleKey: string, payload: T) {
  await ensureStorageTable();
  const pool = await getPool();
  await pool.query(
    `
      INSERT INTO ${STORAGE_TABLE} (module_key, payload, updated_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (module_key)
      DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
    `,
    [moduleKey, JSON.stringify(payload)],
  );
}
