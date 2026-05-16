import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { resolveJsonDataFilePath } from "@/lib/storage/json-file";
import { readPostgresJsonStore, writePostgresJsonStore } from "@/lib/storage/postgres-json";

import { COMPANY_CONTENT_SEED_DATA } from "./seed";
import { type CompanyContent } from "./types";

const relativeDataFilePath = path.join("data", "company.json");
const dataFilePath = resolveJsonDataFilePath(relativeDataFilePath);
const storageDriver = process.env.COMPANY_STORAGE_DRIVER ?? "json";
const postgresModuleKey = "company";

export function getCompanyStorageDriver() {
  return storageDriver;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
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
    socialChannels: input.socialChannels ?? fallback.socialChannels,
    pendingSocialChannels: input.pendingSocialChannels ?? fallback.pendingSocialChannels,
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

export async function writeCompanyContent(data: CompanyContent) {
  if (storageDriver === "postgres") {
    await writePostgresJsonStore(postgresModuleKey, data);
    return;
  }

  if (storageDriver !== "json") {
    throw new Error("COMPANY_STORAGE_DRIVER is not implemented. Use json or postgres.");
  }

  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
