import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { COMMERCE_SEED_DATA } from "./seed";
import { type CommerceData } from "./types";

const relativeDataFilePath = path.join("data", "commerce.json");

function resolveDataFilePath() {
  const candidates = [
    path.join(process.cwd(), relativeDataFilePath),
    path.join(process.cwd(), "apps", "web", relativeDataFilePath),
  ];
  const existingPath = candidates.find((candidatePath) => existsSync(candidatePath));
  return existingPath ?? candidates[0];
}

const dataFilePath = resolveDataFilePath();
const storageDriver = process.env.COMMERCE_STORAGE_DRIVER ?? "json";

function mergeCommerceData(input: Partial<CommerceData> | null | undefined): CommerceData {
  if (!input) {
    return structuredClone(COMMERCE_SEED_DATA);
  }

  return {
    products: input.products ?? COMMERCE_SEED_DATA.products,
    promos: input.promos ?? COMMERCE_SEED_DATA.promos,
    deliverySlots: input.deliverySlots ?? COMMERCE_SEED_DATA.deliverySlots,
    orders: input.orders ?? COMMERCE_SEED_DATA.orders,
    subscriptions: input.subscriptions ?? COMMERCE_SEED_DATA.subscriptions,
    webhookEvents: input.webhookEvents ?? COMMERCE_SEED_DATA.webhookEvents,
  };
}

export async function readCommerceData(): Promise<CommerceData> {
  if (storageDriver !== "json") {
    throw new Error("COMMERCE_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.");
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
  if (storageDriver !== "json") {
    throw new Error("COMMERCE_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.");
  }

  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
