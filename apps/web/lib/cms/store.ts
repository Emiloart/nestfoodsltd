import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { revalidateTag, unstable_cache } from "next/cache";

import { readPostgresJsonStore, writePostgresJsonStore } from "@/lib/storage/postgres-json";
import { resolveJsonDataFilePath } from "@/lib/storage/json-file";

import { CMS_SEED_DATA } from "./seed";
import { type CmsData } from "./types";

const relativeDataFilePath = path.join("data", "cms.json");

const dataFilePath = resolveJsonDataFilePath(relativeDataFilePath);
const storageDriver = process.env.CMS_STORAGE_DRIVER ?? "json";
const postgresModuleKey = "cms";
const legacyDefaultBannerImageUrl = "/media/products/nestfoodsltd-family-loaf-texture.png";
const currentDefaultDesktopBannerImageUrl = "/media/banners/de-nest-bread-desktop-banner.jpg";
const homePageTitle = "Nest Foods Ltd | De-Nest Bread";

// Shared cache tag for all public CMS reads. writeCmsData() revalidates this
// tag on every write so edits are reflected immediately without waiting for
// the revalidate window below to expire.
const CMS_CACHE_TAG = "cms";

function normalizeCmsBanners(input: Partial<CmsData> | null | undefined) {
  if (!input?.banners) {
    return CMS_SEED_DATA.banners;
  }

  return input.banners.map((banner, index) => {
    const fallbackBanner = CMS_SEED_DATA.banners.find((entry) => entry.id === banner.id) ??
      CMS_SEED_DATA.banners[index] ??
      CMS_SEED_DATA.banners[0];
    const isLegacyDefaultBanner =
      banner.id === "banner-home-1" &&
      banner.imageUrl === legacyDefaultBannerImageUrl &&
      !banner.desktopImageUrl;
    const desktopImageUrl =
      banner.desktopImageUrl?.trim() ||
      (isLegacyDefaultBanner ? currentDefaultDesktopBannerImageUrl : banner.imageUrl?.trim()) ||
      fallbackBanner?.desktopImageUrl ||
      fallbackBanner?.imageUrl ||
      currentDefaultDesktopBannerImageUrl;
    const mobileImageUrl = banner.mobileImageUrl?.trim() || fallbackBanner?.mobileImageUrl;

    return {
      ...fallbackBanner,
      ...banner,
      imageUrl: desktopImageUrl,
      desktopImageUrl,
      mobileImageUrl,
    };
  });
}

function mergeCmsData(input: Partial<CmsData> | null | undefined): CmsData {
  if (!input) {
    return structuredClone(CMS_SEED_DATA);
  }

  const mergedPages = { ...CMS_SEED_DATA.pages };
  for (const [slug, fallbackPage] of Object.entries(CMS_SEED_DATA.pages)) {
    const sourcePage = input.pages?.[slug as keyof typeof input.pages];
    const sourceSeo = sourcePage?.seo;
    mergedPages[slug as keyof typeof mergedPages] = {
      ...fallbackPage,
      ...sourcePage,
      title:
        slug === "home" && (!sourcePage?.title || sourcePage.title === "De-Nest Bread")
          ? homePageTitle
          : sourcePage?.title ?? fallbackPage.title,
      seo: {
        ...fallbackPage.seo,
        ...sourceSeo,
        title:
          slug === "home" &&
          (!sourceSeo?.title || sourceSeo.title === "De-Nest Bread | Premium Bread Manufacturer")
            ? homePageTitle
            : sourceSeo?.title ?? fallbackPage.seo.title,
      },
      revisions: sourcePage?.revisions ?? fallbackPage.revisions,
    };
  }

  return {
    pages: mergedPages,
    banners: normalizeCmsBanners(input),
    media: input.media ?? CMS_SEED_DATA.media,
  };
}

/**
 * Always-fresh read. Use this for write flows (read-modify-write) and for
 * admin/preview views that must see unpublished changes immediately. Do NOT
 * use this directly from public page renders — use getCachedCmsData() there.
 */
export async function readCmsData(): Promise<CmsData> {
  if (storageDriver === "postgres") {
    const payload = await readPostgresJsonStore<Partial<CmsData>>(postgresModuleKey, CMS_SEED_DATA);
    return mergeCmsData(payload);
  }

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

/**
 * Cached read for public-facing pages (home, product pages, banners, etc).
 * Tagged "cms" so writeCmsData() can invalidate it immediately on publish,
 * with a 60s revalidate window as a safety net. This is what stops every
 * pageview from hitting Postgres directly.
 */
export const getCachedCmsData = unstable_cache(
  async (): Promise<CmsData> => readCmsData(),
  ["cms-data"],
  { revalidate: 60, tags: [CMS_CACHE_TAG] },
);

export async function writeCmsData(data: CmsData) {
  if (storageDriver === "postgres") {
    await writePostgresJsonStore(postgresModuleKey, data);
  } else if (storageDriver === "json") {
    await mkdir(path.dirname(dataFilePath), { recursive: true });
    await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
  } else {
    throw new Error("CMS_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.");
  }

  revalidateTag(CMS_CACHE_TAG, { expire: 0 });
}
