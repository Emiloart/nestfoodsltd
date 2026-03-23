import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { readPostgresJsonStore, writePostgresJsonStore } from "@/lib/storage/postgres-json";

import { type AuditData } from "./types";

const relativeDataFilePath = path.join("data", "audit-log.json");

function resolveDataFilePath() {
  const fallbackPath = path.join(process.cwd(), relativeDataFilePath);
  const candidates = [fallbackPath, path.join(process.cwd(), "apps", "web", relativeDataFilePath)];
  const existingPath = candidates.find((candidatePath) => existsSync(candidatePath));
  return existingPath ?? fallbackPath;
}

const dataFilePath = resolveDataFilePath();
const storageDriver = process.env.AUDIT_LOG_STORAGE_DRIVER ?? "json";
const postgresModuleKey = "audit";

function mergeAuditData(input: Partial<AuditData> | null | undefined): AuditData {
  return {
    events: input?.events ?? [],
  };
}

export async function readAuditData(): Promise<AuditData> {
  if (storageDriver === "postgres") {
    const payload = await readPostgresJsonStore<Partial<AuditData>>(postgresModuleKey, {
      events: [],
    });
    return mergeAuditData(payload);
  }

  if (storageDriver !== "json") {
    throw new Error(
      "AUDIT_LOG_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.",
    );
  }

  try {
    const raw = await readFile(dataFilePath, "utf8");
    return mergeAuditData(JSON.parse(raw) as Partial<AuditData>);
  } catch {
    const initial = mergeAuditData(null);
    await writeAuditData(initial);
    return initial;
  }
}

export async function writeAuditData(data: AuditData) {
  if (storageDriver === "postgres") {
    await writePostgresJsonStore(postgresModuleKey, data);
    return;
  }

  if (storageDriver !== "json") {
    throw new Error(
      "AUDIT_LOG_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.",
    );
  }

  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
