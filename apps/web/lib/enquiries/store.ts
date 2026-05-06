import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { resolveJsonDataFilePath } from "@/lib/storage/json-file";
import { readPostgresJsonStore, writePostgresJsonStore } from "@/lib/storage/postgres-json";

import { type EnquiriesData } from "./types";

const relativeDataFilePath = path.join("data", "enquiries.json");
const dataFilePath = resolveJsonDataFilePath(relativeDataFilePath);
const storageDriver = process.env.ENQUIRIES_STORAGE_DRIVER ?? "json";
const postgresModuleKey = "enquiries";

function mergeEnquiriesData(input: Partial<EnquiriesData> | null | undefined): EnquiriesData {
  return {
    enquiries: input?.enquiries ?? [],
  };
}

export function getEnquiriesStorageDriver() {
  return storageDriver;
}

export async function readEnquiriesData(): Promise<EnquiriesData> {
  if (storageDriver === "postgres") {
    const payload = await readPostgresJsonStore<Partial<EnquiriesData>>(postgresModuleKey, {
      enquiries: [],
    });
    return mergeEnquiriesData(payload);
  }

  if (storageDriver !== "json") {
    throw new Error("ENQUIRIES_STORAGE_DRIVER is not implemented. Use json or postgres.");
  }

  try {
    const raw = await readFile(dataFilePath, "utf8");
    return mergeEnquiriesData(JSON.parse(raw) as Partial<EnquiriesData>);
  } catch {
    const initial = mergeEnquiriesData(null);
    await writeEnquiriesData(initial);
    return initial;
  }
}

export async function writeEnquiriesData(data: EnquiriesData) {
  if (storageDriver === "postgres") {
    await writePostgresJsonStore(postgresModuleKey, data);
    return;
  }

  if (storageDriver !== "json") {
    throw new Error("ENQUIRIES_STORAGE_DRIVER is not implemented. Use json or postgres.");
  }

  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
