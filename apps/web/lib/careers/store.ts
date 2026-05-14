import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { resolveJsonDataFilePath } from "@/lib/storage/json-file";
import { readPostgresJsonStore, writePostgresJsonStore } from "@/lib/storage/postgres-json";

import { type CareersData } from "./types";

const relativeDataFilePath = path.join("data", "careers.json");
const dataFilePath = resolveJsonDataFilePath(relativeDataFilePath);
const storageDriver = process.env.CAREERS_STORAGE_DRIVER ?? "json";
const postgresModuleKey = "careers";

function mergeCareersData(input: Partial<CareersData> | null | undefined): CareersData {
  return {
    applications: input?.applications ?? [],
  };
}

export function getCareersStorageDriver() {
  return storageDriver;
}

export async function readCareersData(): Promise<CareersData> {
  if (storageDriver === "postgres") {
    const payload = await readPostgresJsonStore<Partial<CareersData>>(postgresModuleKey, {
      applications: [],
    });
    return mergeCareersData(payload);
  }

  if (storageDriver !== "json") {
    throw new Error("CAREERS_STORAGE_DRIVER is not implemented. Use json or postgres.");
  }

  try {
    const raw = await readFile(dataFilePath, "utf8");
    return mergeCareersData(JSON.parse(raw) as Partial<CareersData>);
  } catch {
    const initial = mergeCareersData(null);
    await writeCareersData(initial);
    return initial;
  }
}

export async function writeCareersData(data: CareersData) {
  if (storageDriver === "postgres") {
    await writePostgresJsonStore(postgresModuleKey, data);
    return;
  }

  if (storageDriver !== "json") {
    throw new Error("CAREERS_STORAGE_DRIVER is not implemented. Use json or postgres.");
  }

  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
