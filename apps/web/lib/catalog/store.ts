import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { revalidateTag, unstable_cache } from "next/cache";

import { resolveJsonDataFilePath } from "@/lib/storage/json-file";
import { readPostgresJsonStore, writePostgresJsonStore } from "@/lib/storage/postgres-json";

import { CATALOGUE_SEED_DATA } from "./seed";
import { type CatalogueData } from "./types";
import { normalizeCurrentCatalogueProducts } from "./current-products";

const relativeDataFilePath = path.join("data", "catalog.json");
const dataFilePath = resolveJsonDataFilePath(relativeDataFilePath);
const storageDriver = process.env.CATALOG_STORAGE_DRIVER ?? "json";
const postgresModuleKey = "catalog";

// Shared cache tag for public catalogue reads. writeCatalogueData()
// revalidates this tag on every write so admin changes go live immediately.
const CATALOG_CACHE_TAG = "catalog";

function mergeCatalogueData(input: Partial<CatalogueData> | null | undefined): CatalogueData {
  if (!input) {
    return structuredClone(CATALOGUE_SEED_DATA);
  }

  return {
    products: normalizeCurrentCatalogueProducts(input.products ?? CATALOGUE_SEED_DATA.products),
  };
}

/**
 * Always-fresh read. Use for write flows (read-modify-write) and for admin
 * views that must include drafts. Public storefront reads should use
 * getCachedCatalogueData() instead to avoid a DB round-trip per pageview.
 */
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

/**
 * Cached read for public storefront pages (listing, product detail,
 * sitemap). Tagged "catalog" so writeCatalogueData() can invalidate it
 * immediately on publish, with a 60s revalidate window as a safety net.
 */
export const getCachedCatalogueData = unstable_cache(
  async (): Promise<CatalogueData> => readCatalogueData(),
  ["catalog-data"],
  { revalidate: 60, tags: [CATALOG_CACHE_TAG] },
);

export async function writeCatalogueData(data: CatalogueData) {
  if (storageDriver === "postgres") {
    await writePostgresJsonStore(postgresModuleKey, data);
  } else if (storageDriver === "json") {
    await mkdir(path.dirname(dataFilePath), { recursive: true });
    await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
  } else {
    throw new Error("CATALOG_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.");
  }

  revalidateTag(CATALOG_CACHE_TAG, { expire: 0 });
}
