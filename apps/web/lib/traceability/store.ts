import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { TRACEABILITY_SEED_DATA } from "./seed";
import { type TraceabilityData } from "./types";

const relativeDataFilePath = path.join("data", "traceability.json");

function resolveDataFilePath() {
  const candidates = [
    path.join(process.cwd(), relativeDataFilePath),
    path.join(process.cwd(), "apps", "web", relativeDataFilePath),
  ];
  const existingPath = candidates.find((candidatePath) => existsSync(candidatePath));
  return existingPath ?? candidates[0];
}

const dataFilePath = resolveDataFilePath();
const storageDriver = process.env.TRACEABILITY_STORAGE_DRIVER ?? "json";

function mergeTraceabilityData(
  input: Partial<TraceabilityData> | null | undefined,
): TraceabilityData {
  if (!input) {
    return structuredClone(TRACEABILITY_SEED_DATA);
  }

  return {
    batches: input.batches ?? TRACEABILITY_SEED_DATA.batches,
  };
}

export async function readTraceabilityData(): Promise<TraceabilityData> {
  if (storageDriver !== "json") {
    throw new Error(
      "TRACEABILITY_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.",
    );
  }

  try {
    const raw = await readFile(dataFilePath, "utf8");
    return mergeTraceabilityData(JSON.parse(raw) as Partial<TraceabilityData>);
  } catch {
    await writeTraceabilityData(TRACEABILITY_SEED_DATA);
    return TRACEABILITY_SEED_DATA;
  }
}

export async function writeTraceabilityData(data: TraceabilityData) {
  if (storageDriver !== "json") {
    throw new Error(
      "TRACEABILITY_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.",
    );
  }

  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
