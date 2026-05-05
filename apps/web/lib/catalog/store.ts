import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { resolveJsonDataFilePath } from "@/lib/storage/json-file";
import { readPostgresJsonStore, writePostgresJsonStore } from "@/lib/storage/postgres-json";

import { CATALOGUE_SEED_DATA } from "./seed";
import { type CatalogueData } from "./types";

const relativeDataFilePath = path.join("data", "catalog.json");
const dataFilePath = resolveJsonDataFilePath(relativeDataFilePath);
const storageDriver = process.env.CATALOG_STORAGE_DRIVER ?? "json";
const postgresModuleKey = "catalog";

function mergeCatalogueData(input: Partial<CatalogueData> | null | undefined): CatalogueData {
  if (!input) {
    return structuredClone(CATALOGUE_SEED_DATA);
  }

  return {
    products: input.products ?? CATALOGUE_SEED_DATA.products,
  };
}

export async function readCatalogueData(): Promise<CatalogueData> {
  if (storageDriver === "postgres") {
    const payload = await readPostgresJsonStore<Partial<CatalogueData>>(
      postgresModuleKey,
      CATALOGUE_SEED_DATA,
    );
    return mergeCatalogueData(payload);
  }

  if (storageDriver !== "json") {
    throw new Error("CATALOG_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.");
  }

  try {
    const raw = await readFile(dataFilePath, "utf8");
    return mergeCatalogueData(JSON.parse(raw) as Partial<CatalogueData>);
  } catch {
    await writeCatalogueData(CATALOGUE_SEED_DATA);
    return CATALOGUE_SEED_DATA;
  }
}

export async function writeCatalogueData(data: CatalogueData) {
  if (storageDriver === "postgres") {
    await writePostgresJsonStore(postgresModuleKey, data);
    return;
  }

  if (storageDriver !== "json") {
    throw new Error("CATALOG_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.");
  }

  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
