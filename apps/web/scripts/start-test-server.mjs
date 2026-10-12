import { mkdtemp, cp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";

const appRoot = fileURLToPath(new URL("../", import.meta.url));
const dataDirectory = await mkdtemp(path.join(tmpdir(), "nestfoods-e2e-"));
for (const name of ["company.json", "cms.json", "catalog.json"])
  await cp(path.join(appRoot, "data", name), path.join(dataDirectory, name));
const env = {
  ...process.env,
  DATABASE_URL: "",
  EMAIL_PROVIDER: "disabled",
  AUTH_SECRET: "nestfoods-local-regression-secret",
  NESTFOODS_DATA_DIR: dataDirectory,
  NEXT_TELEMETRY_DISABLED: "1",
};
for (const name of [
  "CMS",
  "COMPANY",
  "CATALOG",
  "PRIVACY",
  "ENQUIRIES",
  "CAREERS",
  "NEWSLETTER",
  "OBSERVABILITY",
  "ADMIN_USERS",
  "AUDIT",
  "CHAT",
])
  env[`${name}_STORAGE_DRIVER`] = "json";
const require = createRequire(import.meta.url);
const server = spawn(
  process.execPath,
  [require.resolve("next/dist/bin/next"), "start", "--port", "3100"],
  { cwd: appRoot, env, stdio: "inherit" },
);
for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => server.kill(signal));
server.on("exit", async (code) => {
  await rm(dataDirectory, { recursive: true, force: true });
  process.exit(code ?? 0);
});
