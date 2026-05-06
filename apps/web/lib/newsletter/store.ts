import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { resolveJsonDataFilePath } from "@/lib/storage/json-file";
import { readPostgresJsonStore, writePostgresJsonStore } from "@/lib/storage/postgres-json";

import { type NewsletterData } from "./types";

const relativeDataFilePath = path.join("data", "newsletter.json");
const dataFilePath = resolveJsonDataFilePath(relativeDataFilePath);
const storageDriver = process.env.NEWSLETTER_STORAGE_DRIVER ?? "json";
const postgresModuleKey = "newsletter";

function mergeNewsletterData(input: Partial<NewsletterData> | null | undefined): NewsletterData {
  return {
    subscribers: input?.subscribers ?? [],
  };
}

export function getNewsletterStorageDriver() {
  return storageDriver;
}

export async function readNewsletterData(): Promise<NewsletterData> {
  if (storageDriver === "postgres") {
    const payload = await readPostgresJsonStore<Partial<NewsletterData>>(postgresModuleKey, {
      subscribers: [],
    });
    return mergeNewsletterData(payload);
  }

  if (storageDriver !== "json") {
    throw new Error("NEWSLETTER_STORAGE_DRIVER is not implemented. Use json or postgres.");
  }

  try {
    const raw = await readFile(dataFilePath, "utf8");
    return mergeNewsletterData(JSON.parse(raw) as Partial<NewsletterData>);
  } catch {
    const initial = mergeNewsletterData(null);
    await writeNewsletterData(initial);
    return initial;
  }
}

export async function writeNewsletterData(data: NewsletterData) {
  if (storageDriver === "postgres") {
    await writePostgresJsonStore(postgresModuleKey, data);
    return;
  }

  if (storageDriver !== "json") {
    throw new Error("NEWSLETTER_STORAGE_DRIVER is not implemented. Use json or postgres.");
  }

  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
