type PgPool = import("pg").Pool;

const STORAGE_TABLE = "app_json_storage";

function getGlobalCache() {
  const globalObject = globalThis as typeof globalThis & {
    __nestfoodsltdPgPool?: PgPool;
    __nestfoodsltdPgEnsurePromise?: Promise<void>;
  };
  return globalObject;
}

async function getPool(): Promise<PgPool> {
  const cache = getGlobalCache();
  if (cache.__nestfoodsltdPgPool) {
    return cache.__nestfoodsltdPgPool;
  }

  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is required when using postgres storage drivers.");
  }

  const { Pool } = await import("pg");
  cache.__nestfoodsltdPgPool = new Pool({ connectionString });
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
