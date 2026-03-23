import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { readPostgresJsonStore, writePostgresJsonStore } from "@/lib/storage/postgres-json";

import { type PrivacyData } from "./types";

const relativeDataFilePath = path.join("data", "privacy.json");

function resolveDataFilePath() {
  const fallbackPath = path.join(process.cwd(), relativeDataFilePath);
  const candidates = [fallbackPath, path.join(process.cwd(), "apps", "web", relativeDataFilePath)];
  const existingPath = candidates.find((candidatePath) => existsSync(candidatePath));
  return existingPath ?? fallbackPath;
}

const dataFilePath = resolveDataFilePath();
const storageDriver = process.env.PRIVACY_STORAGE_DRIVER ?? "json";
const postgresModuleKey = "privacy";

function mergePrivacyData(input: Partial<PrivacyData> | null | undefined): PrivacyData {
  return {
    consents: input?.consents ?? [],
    dataRequests: input?.dataRequests ?? [],
  };
}

export async function readPrivacyData(): Promise<PrivacyData> {
  if (storageDriver === "postgres") {
    const payload = await readPostgresJsonStore<Partial<PrivacyData>>(postgresModuleKey, {
      consents: [],
      dataRequests: [],
    });
    return mergePrivacyData(payload);
  }

  if (storageDriver !== "json") {
    throw new Error("PRIVACY_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.");
  }

  try {
    const raw = await readFile(dataFilePath, "utf8");
    return mergePrivacyData(JSON.parse(raw) as Partial<PrivacyData>);
  } catch {
    const initial = mergePrivacyData(null);
    await writePrivacyData(initial);
    return initial;
  }
}

export async function writePrivacyData(data: PrivacyData) {
  if (storageDriver === "postgres") {
    await writePostgresJsonStore(postgresModuleKey, data);
    return;
  }

  if (storageDriver !== "json") {
    throw new Error("PRIVACY_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.");
  }

  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
