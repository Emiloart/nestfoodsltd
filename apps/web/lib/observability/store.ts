import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { readPostgresJsonStore, writePostgresJsonStore } from "@/lib/storage/postgres-json";
import { resolveJsonDataFilePath } from "@/lib/storage/json-file";

import { type ObservabilityData } from "./types";

const relativeDataFilePath = path.join("data", "observability.json");

const dataFilePath = resolveJsonDataFilePath(relativeDataFilePath);
const storageDriver = process.env.OBSERVABILITY_STORAGE_DRIVER ?? "json";
const postgresModuleKey = "observability";

function mergeObservabilityData(
  input: Partial<ObservabilityData> | null | undefined,
): ObservabilityData {
  return {
    webVitals: input?.webVitals ?? [],
    errors: input?.errors ?? [],
  };
}

export async function readObservabilityData(): Promise<ObservabilityData> {
  if (storageDriver === "postgres") {
    const payload = await readPostgresJsonStore<Partial<ObservabilityData>>(postgresModuleKey, {
      webVitals: [],
      errors: [],
    });
    return mergeObservabilityData(payload);
  }

  if (storageDriver !== "json") {
    throw new Error(
      "OBSERVABILITY_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.",
    );
  }

  try {
    const raw = await readFile(dataFilePath, "utf8");
    return mergeObservabilityData(JSON.parse(raw) as Partial<ObservabilityData>);
  } catch {
    const initial = mergeObservabilityData(null);
    await writeObservabilityData(initial);
    return initial;
  }
}

export async function writeObservabilityData(data: ObservabilityData) {
  if (storageDriver === "postgres") {
    await writePostgresJsonStore(postgresModuleKey, data);
    return;
  }

  if (storageDriver !== "json") {
    throw new Error(
      "OBSERVABILITY_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.",
    );
  }

  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
