import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { readPostgresJsonStore, writePostgresJsonStore } from "@/lib/storage/postgres-json";
import { resolveJsonDataFilePath } from "@/lib/storage/json-file";

import { COMMERCE_SEED_DATA } from "./seed";
import { type CommerceData } from "./types";

const relativeDataFilePath = path.join("data", "commerce.json");

const dataFilePath = resolveJsonDataFilePath(relativeDataFilePath);
const storageDriver = process.env.COMMERCE_STORAGE_DRIVER ?? "json";
const postgresModuleKey = "commerce";

function mergeCommerceData(input: Partial<CommerceData> | null | undefined): CommerceData {
  if (!input) {
    return structuredClone(COMMERCE_SEED_DATA);
  }

  return {
    products: input.products ?? COMMERCE_SEED_DATA.products,
  };
}

export async function readCommerceData(): Promise<CommerceData> {
  if (storageDriver === "postgres") {
    const payload = await readPostgresJsonStore<Partial<CommerceData>>(
      postgresModuleKey,
      COMMERCE_SEED_DATA,
    );
    return mergeCommerceData(payload);
  }

  if (storageDriver !== "json") {
    throw new Error(
      "COMMERCE_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.",
    );
  }

  try {
    const raw = await readFile(dataFilePath, "utf8");
    return mergeCommerceData(JSON.parse(raw) as Partial<CommerceData>);
  } catch {
    await writeCommerceData(COMMERCE_SEED_DATA);
    return COMMERCE_SEED_DATA;
  }
}

export async function writeCommerceData(data: CommerceData) {
  if (storageDriver === "postgres") {
    await writePostgresJsonStore(postgresModuleKey, data);
    return;
  }

  if (storageDriver !== "json") {
    throw new Error(
      "COMMERCE_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.",
    );
  }

  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
