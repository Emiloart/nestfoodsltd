import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { type ObservabilityData } from "./types";

const relativeDataFilePath = path.join("data", "observability.json");

function resolveDataFilePath() {
  const fallbackPath = path.join(process.cwd(), relativeDataFilePath);
  const candidates = [fallbackPath, path.join(process.cwd(), "apps", "web", relativeDataFilePath)];
  const existingPath = candidates.find((candidatePath) => existsSync(candidatePath));
  return existingPath ?? fallbackPath;
}

const dataFilePath = resolveDataFilePath();
const storageDriver = process.env.OBSERVABILITY_STORAGE_DRIVER ?? "json";

function mergeObservabilityData(
  input: Partial<ObservabilityData> | null | undefined,
): ObservabilityData {
  return {
    webVitals: input?.webVitals ?? [],
    errors: input?.errors ?? [],
  };
}

export async function readObservabilityData(): Promise<ObservabilityData> {
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
  if (storageDriver !== "json") {
    throw new Error(
      "OBSERVABILITY_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.",
    );
  }

  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
