import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

import { CMS_SEED_DATA } from "./seed";
import { type CmsData } from "./types";

const relativeDataFilePath = path.join("data", "cms.json");

function resolveDataFilePath() {
  const candidates = [
    path.join(process.cwd(), relativeDataFilePath),
    path.join(process.cwd(), "apps", "web", relativeDataFilePath),
  ];

  const existingPath = candidates.find((candidatePath) => existsSync(candidatePath));
  return existingPath ?? candidates[0];
}

const dataFilePath = resolveDataFilePath();
const storageDriver = process.env.CMS_STORAGE_DRIVER ?? "json";

function mergeCmsData(input: Partial<CmsData> | null | undefined): CmsData {
  if (!input) {
    return structuredClone(CMS_SEED_DATA);
  }

  const mergedPages = { ...CMS_SEED_DATA.pages };
  for (const [slug, fallbackPage] of Object.entries(CMS_SEED_DATA.pages)) {
    const sourcePage = input.pages?.[slug as keyof typeof input.pages];
    mergedPages[slug as keyof typeof mergedPages] = {
      ...fallbackPage,
      ...sourcePage,
      seo: {
        ...fallbackPage.seo,
        ...sourcePage?.seo,
      },
      revisions: sourcePage?.revisions ?? fallbackPage.revisions,
    };
  }

  return {
    pages: mergedPages,
    banners: input.banners ?? CMS_SEED_DATA.banners,
    media: input.media ?? CMS_SEED_DATA.media,
    products: input.products ?? CMS_SEED_DATA.products,
    recipes: input.recipes ?? CMS_SEED_DATA.recipes,
  };
}

export async function readCmsData(): Promise<CmsData> {
  if (storageDriver !== "json") {
    throw new Error("CMS_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.");
  }

  try {
    const raw = await readFile(dataFilePath, "utf8");
    return mergeCmsData(JSON.parse(raw) as Partial<CmsData>);
  } catch {
    await writeCmsData(CMS_SEED_DATA);
    return CMS_SEED_DATA;
  }
}

export async function writeCmsData(data: CmsData) {
  if (storageDriver !== "json") {
    throw new Error("CMS_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.");
  }

  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
