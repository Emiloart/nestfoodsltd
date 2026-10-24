import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { revalidateTag, unstable_cache } from "next/cache";

import { resolveJsonDataFilePath } from "@/lib/storage/json-file";
import { readPostgresJsonStore, writePostgresJsonStore } from "@/lib/storage/postgres-json";

import { COMPANY_CONTENT_SEED_DATA } from "./seed";
import { type CompanyContent } from "./types";

const relativeDataFilePath = path.join("data", "company.json");
const dataFilePath = resolveJsonDataFilePath(relativeDataFilePath);
const storageDriver = process.env.COMPANY_STORAGE_DRIVER ?? "json";
const postgresModuleKey = "company";

// Shared cache tag for company content. writeCompanyContent() revalidates
// this tag on every write so admin edits go live immediately.
const COMPANY_CACHE_TAG = "company";

export function getCompanyStorageDriver() {
  return storageDriver;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function mergeSocialChannels(
  input: CompanyContent["socialChannels"] | undefined,
  fallback: CompanyContent["socialChannels"],
) {
  const merged = [...(input ?? [])];
  for (const channel of fallback) {
    const alreadyExists = merged.some(
      (entry) => entry.id === channel.id || entry.href === channel.href,
    );
    if (!alreadyExists) {
      merged.push(channel);
    }
  }

  return merged;
}

function mergePendingSocialChannels(input: string[] | undefined, fallback: string[]) {
  const activeSocialLabels = new Set(
    COMPANY_CONTENT_SEED_DATA.socialChannels.map((channel) => channel.label.toLowerCase()),
  );
  const source = isStringArray(input) ? input : fallback;
  return source.filter((label) => !activeSocialLabels.has(label.toLowerCase()));
}

function mergeCompanyContent(input: Partial<CompanyContent> | null | undefined): CompanyContent {
  if (!input) {
    return structuredClone(COMPANY_CONTENT_SEED_DATA);
  }

  const fallback = COMPANY_CONTENT_SEED_DATA;
  return {
    story: isStringArray(input.story) ? input.story : fallback.story,
    vision: input.vision?.trim() || fallback.vision,
    mission: input.mission?.trim() || fallback.mission,
    founderStory: isStringArray(input.founderStory) ? input.founderStory : fallback.founderStory,
    coreValues: input.coreValues ?? fallback.coreValues,
    milestones: input.milestones ?? fallback.milestones,
    certifications: input.certifications ?? fallback.certifications,
    faqs: input.faqs ?? fallback.faqs,
    contactChannels: input.contactChannels ?? fallback.contactChannels,
    whatsappContacts: input.whatsappContacts ?? fallback.whatsappContacts,
    socialChannels: mergeSocialChannels(input.socialChannels, fallback.socialChannels),
    pendingSocialChannels: mergePendingSocialChannels(
      input.pendingSocialChannels,
      fallback.pendingSocialChannels,
    ),
    branchLocations: input.branchLocations ?? fallback.branchLocations,
    headOfficeMapUrl: input.headOfficeMapUrl?.trim() || fallback.headOfficeMapUrl,
    headOfficeEmbedMapUrl: input.headOfficeEmbedMapUrl?.trim() || fallback.headOfficeEmbedMapUrl,
    trustCertifications: input.trustCertifications ?? fallback.trustCertifications,
    careers: {
      ...fallback.careers,
      ...input.careers,
      roles: isStringArray(input.careers?.roles) ? input.careers.roles : fallback.careers.roles,
      applicationRequirements: isStringArray(input.careers?.applicationRequirements)
        ? input.careers.applicationRequirements
        : fallback.careers.applicationRequirements,
      equalOpportunity: isStringArray(input.careers?.equalOpportunity)
        ? input.careers.equalOpportunity
        : fallback.careers.equalOpportunity,
    },
    updatedAt: input.updatedAt?.trim() || fallback.updatedAt,
  };
}

/**
 * Always-fresh read. Use for write flows (read-modify-write). Page renders
 * should use getCachedCompanyContent() instead to avoid a DB round-trip on
 * every request — this data is effectively global (header/footer/contact)
 * so it was previously fetched fresh on every single pageview.
 */
export async function readCompanyContent(): Promise<CompanyContent> {
  if (storageDriver === "postgres") {
    const payload = await readPostgresJsonStore<Partial<CompanyContent>>(
      postgresModuleKey,
      COMPANY_CONTENT_SEED_DATA,
    );
    return mergeCompanyContent(payload);
  }

  if (storageDriver !== "json") {
    throw new Error("COMPANY_STORAGE_DRIVER is not implemented. Use json or postgres.");
  }

  try {
    const raw = await readFile(dataFilePath, "utf8");
    return mergeCompanyContent(JSON.parse(raw) as Partial<CompanyContent>);
  } catch {
    await writeCompanyContent(COMPANY_CONTENT_SEED_DATA);
    return COMPANY_CONTENT_SEED_DATA;
  }
}

/**
 * Cached read for page renders. Tagged "company" so writeCompanyContent()
 * can invalidate it immediately on save, with a 5 minute revalidate window
 * as a safety net (this content changes rarely).
 */
export const getCachedCompanyContent = unstable_cache(
  async (): Promise<CompanyContent> => readCompanyContent(),
  ["company-data"],
  { revalidate: 300, tags: [COMPANY_CACHE_TAG] },
);

export async function writeCompanyContent(data: CompanyContent) {
  if (storageDriver === "postgres") {
    await writePostgresJsonStore(postgresModuleKey, data);
  } else if (storageDriver === "json") {
    await mkdir(path.dirname(dataFilePath), { recursive: true });
    await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
  } else {
    throw new Error("COMPANY_STORAGE_DRIVER is not implemented. Use json or postgres.");
  }

  revalidateTag(COMPANY_CACHE_TAG, { expire: 0 });
}
