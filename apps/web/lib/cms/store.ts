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

export async function readCmsData(): Promise<CmsData> {
  try {
    const raw = await readFile(dataFilePath, "utf8");
    return JSON.parse(raw) as CmsData;
  } catch {
    await writeCmsData(CMS_SEED_DATA);
    return CMS_SEED_DATA;
  }
}

export async function writeCmsData(data: CmsData) {
  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
