import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { readPostgresJsonStore, writePostgresJsonStore } from "@/lib/storage/postgres-json";

import { B2B_SEED_DATA } from "./seed";
import { type B2BData } from "./types";

const relativeDataFilePath = path.join("data", "b2b.json");

function resolveDataFilePath() {
  const candidates = [
    path.join(process.cwd(), relativeDataFilePath),
    path.join(process.cwd(), "apps", "web", relativeDataFilePath),
  ];
  const existingPath = candidates.find((candidatePath) => existsSync(candidatePath));
  return existingPath ?? candidates[0];
}

const dataFilePath = resolveDataFilePath();
const storageDriver = process.env.B2B_STORAGE_DRIVER ?? "json";
const postgresModuleKey = "b2b";

function mergeB2BData(input: Partial<B2BData> | null | undefined): B2BData {
  if (!input) {
    return structuredClone(B2B_SEED_DATA);
  }

  return {
    pricingTiers: input.pricingTiers ?? B2B_SEED_DATA.pricingTiers,
    accounts: input.accounts ?? B2B_SEED_DATA.accounts,
    quoteRequests: input.quoteRequests ?? B2B_SEED_DATA.quoteRequests,
    orders: input.orders ?? B2B_SEED_DATA.orders,
    invoices: input.invoices ?? B2B_SEED_DATA.invoices,
    statements: input.statements ?? B2B_SEED_DATA.statements,
    supportTickets: input.supportTickets ?? B2B_SEED_DATA.supportTickets,
  };
}

export async function readB2BData(): Promise<B2BData> {
  if (storageDriver === "postgres") {
    const payload = await readPostgresJsonStore<Partial<B2BData>>(postgresModuleKey, B2B_SEED_DATA);
    return mergeB2BData(payload);
  }

  if (storageDriver !== "json") {
    throw new Error("B2B_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.");
  }

  try {
    const raw = await readFile(dataFilePath, "utf8");
    return mergeB2BData(JSON.parse(raw) as Partial<B2BData>);
  } catch {
    await writeB2BData(B2B_SEED_DATA);
    return B2B_SEED_DATA;
  }
}

export async function writeB2BData(data: B2BData) {
  if (storageDriver === "postgres") {
    await writePostgresJsonStore(postgresModuleKey, data);
    return;
  }

  if (storageDriver !== "json") {
    throw new Error("B2B_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.");
  }

  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
