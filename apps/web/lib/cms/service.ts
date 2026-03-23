import { unstable_noStore as noStore } from "next/cache";

import { type AdminRole } from "@/lib/admin/auth";

import { CMS_SEED_DATA } from "./seed";
import { readCmsData, writeCmsData } from "./store";
import {
  CMS_PAGE_SLUGS,
  type CmsBanner,
  type CmsMediaAsset,
  type CmsPage,
  type CmsPageSlug,
  type CmsPublicationStatus,
} from "./types";

function isLiveStatus(status: CmsPublicationStatus, publishAt?: string) {
  if (status === "published") {
    return true;
  }

  if (status === "scheduled" && publishAt) {
    return new Date(publishAt) <= new Date();
  }

  return false;
}

function isLivePage(page: CmsPage) {
  return isLiveStatus(page.status, page.publishAt);
}

type CreateCmsBannerInput = Omit<CmsBanner, "id" | "updatedAt"> & {
  id?: string;
};

type UpdateCmsBannerInput = Partial<Omit<CmsBanner, "id" | "updatedAt">>;
type CreateCmsMediaAssetInput = Omit<CmsMediaAsset, "id" | "updatedAt"> & {
  id?: string;
};
type UpdateCmsMediaAssetInput = Partial<Omit<CmsMediaAsset, "id" | "updatedAt">>;

export type CmsMediaAssetWithUsage = CmsMediaAsset & {
  usageReferences: string[];
};

function normalizeBannerStatus(status: CmsPublicationStatus) {
  if (status === "draft" || status === "scheduled" || status === "published") {
    return status;
  }
  return "draft";
}

function normalizeBannerOrder(value: number, fallbackOrder: number) {
  const numericOrder = Math.round(Number(value));
  if (!Number.isFinite(numericOrder) || numericOrder < 1) {
    return fallbackOrder;
  }
  return numericOrder;
}

function normalizeBannersOrder(banners: CmsBanner[]) {
  const sorted = [...banners].sort((left, right) => left.order - right.order);
  return sorted.map((banner, index) => ({
    ...banner,
    order: index + 1,
  }));
}

function buildBannerId(label: string) {
  const prefix = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `banner-${prefix || "item"}-${crypto.randomUUID().slice(0, 8)}`;
}

function buildMediaAssetId(label: string) {
  const prefix = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `media-${prefix || "item"}-${crypto.randomUUID().slice(0, 8)}`;
}

function collectMediaUsageReferences(assetUrl: string, data: Awaited<ReturnType<typeof readCmsData>>) {
  const refs: string[] = [];

  for (const [slug, page] of Object.entries(data.pages)) {
    if (page.heroImageUrl === assetUrl) {
      refs.push(`page:${slug}.heroImageUrl`);
    }
    if (page.logoImageUrl === assetUrl) {
      refs.push(`page:${slug}.logoImageUrl`);
    }
    if (page.seo.ogImageUrl === assetUrl) {
      refs.push(`page:${slug}.seo.ogImageUrl`);
    }
  }

  for (const banner of data.banners) {
    if (banner.imageUrl === assetUrl) {
      refs.push(`banner:${banner.id}.imageUrl`);
    }
  }

  for (const product of data.products) {
    if (product.imageUrl === assetUrl) {
      refs.push(`cms-product:${product.id}.imageUrl`);
    }
  }

  for (const recipe of data.recipes) {
    if (recipe.imageUrl === assetUrl) {
      refs.push(`cms-recipe:${recipe.id}.imageUrl`);
    }
  }

  return refs.sort((left, right) => left.localeCompare(right));
}

export async function getCmsPages(options?: { preview?: boolean }) {
  noStore();
  const data = await readCmsData();
  return CMS_PAGE_SLUGS.map((slug) => {
    const page = data.pages[slug];
    if (options?.preview || isLivePage(page)) {
      return page;
    }
    return {
      ...CMS_SEED_DATA.pages[slug],
      status: page.status,
      updatedAt: page.updatedAt,
      revisions: page.revisions,
    };
  });
}

export async function getCmsPage(slug: CmsPageSlug, options?: { preview?: boolean }) {
  noStore();
  const data = await readCmsData();
  const page = data.pages[slug];

  if (options?.preview || isLivePage(page)) {
    return page;
  }

  return {
    ...CMS_SEED_DATA.pages[slug],
    status: page.status,
    updatedAt: page.updatedAt,
    revisions: page.revisions,
  };
}

export async function updateCmsPage(
  slug: CmsPageSlug,
  input: Omit<CmsPage, "slug" | "updatedAt" | "revisions">,
  updatedByRole: AdminRole,
) {
  const data = await readCmsData();
  const previousPage = data.pages[slug];
  const previousSnapshot = { ...previousPage } as Omit<CmsPage, "revisions"> & {
    revisions?: unknown;
  };
  delete previousSnapshot.revisions;

  const revision = {
    id: crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
    updatedByRole,
    snapshot: previousSnapshot as Omit<CmsPage, "revisions">,
  };

  const updatedPage: CmsPage = {
    slug,
    ...input,
    updatedAt: new Date().toISOString(),
    revisions: [revision, ...previousPage.revisions].slice(0, 20),
  };

  data.pages[slug] = updatedPage;
  await writeCmsData(data);
  return updatedPage;
}

export async function getCmsBanners(options?: { preview?: boolean }) {
  noStore();
  const data = await readCmsData();
  const ordered = [...data.banners].sort((left, right) => left.order - right.order);
  if (options?.preview) {
    return ordered;
  }

  return ordered.filter((banner) => isLiveStatus(banner.status, banner.publishAt));
}

export async function getCmsBannerById(bannerId: string) {
  noStore();
  const data = await readCmsData();
  return data.banners.find((banner) => banner.id === bannerId) ?? null;
}

export async function createCmsBanner(input: CreateCmsBannerInput) {
  const data = await readCmsData();
  const bannerId = input.id?.trim() || buildBannerId(input.label);
  if (data.banners.some((banner) => banner.id === bannerId)) {
    throw new Error("A banner with this id already exists.");
  }

  const fallbackOrder = data.banners.length + 1;
  const now = new Date().toISOString();
  const banner: CmsBanner = {
    id: bannerId,
    label: input.label.trim(),
    headline: input.headline.trim(),
    ctaLabel: input.ctaLabel?.trim() || undefined,
    ctaHref: input.ctaHref?.trim() || undefined,
    imageUrl: input.imageUrl.trim(),
    status: normalizeBannerStatus(input.status),
    publishAt: input.publishAt?.trim() || undefined,
    order: normalizeBannerOrder(input.order, fallbackOrder),
    updatedAt: now,
  };

  data.banners = normalizeBannersOrder([...data.banners, banner]);
  await writeCmsData(data);

  return data.banners.find((entry) => entry.id === banner.id) ?? banner;
}

export async function updateCmsBanner(bannerId: string, input: UpdateCmsBannerInput) {
  const data = await readCmsData();
  const banner = data.banners.find((entry) => entry.id === bannerId);
  if (!banner) {
    throw new Error("Banner not found.");
  }

  if (input.label !== undefined) {
    banner.label = input.label.trim();
  }
  if (input.headline !== undefined) {
    banner.headline = input.headline.trim();
  }
  if (input.ctaLabel !== undefined) {
    banner.ctaLabel = input.ctaLabel.trim() || undefined;
  }
  if (input.ctaHref !== undefined) {
    banner.ctaHref = input.ctaHref.trim() || undefined;
  }
  if (input.imageUrl !== undefined) {
    banner.imageUrl = input.imageUrl.trim();
  }
  if (input.status !== undefined) {
    banner.status = normalizeBannerStatus(input.status);
  }
  if (input.publishAt !== undefined) {
    banner.publishAt = input.publishAt.trim() || undefined;
  }
  if (input.order !== undefined) {
    banner.order = normalizeBannerOrder(input.order, banner.order);
  }
  banner.updatedAt = new Date().toISOString();

  data.banners = normalizeBannersOrder(data.banners);
  await writeCmsData(data);

  const updatedBanner = data.banners.find((entry) => entry.id === bannerId);
  if (!updatedBanner) {
    throw new Error("Banner not found.");
  }
  return updatedBanner;
}

export async function deleteCmsBanner(bannerId: string) {
  const data = await readCmsData();
  const bannerIndex = data.banners.findIndex((entry) => entry.id === bannerId);
  if (bannerIndex < 0) {
    throw new Error("Banner not found.");
  }

  const banner = data.banners[bannerIndex];
  if (!banner) {
    throw new Error("Banner not found.");
  }

  data.banners.splice(bannerIndex, 1);
  data.banners = normalizeBannersOrder(data.banners);
  await writeCmsData(data);
  return banner;
}

export async function getCmsMediaAssets() {
  noStore();
  const data = await readCmsData();
  return data.media;
}

export async function getCmsMediaAssetsWithUsage(): Promise<CmsMediaAssetWithUsage[]> {
  noStore();
  const data = await readCmsData();
  return data.media.map((asset) => ({
    ...asset,
    usageReferences: collectMediaUsageReferences(asset.url, data),
  }));
}

export async function getCmsMediaAssetById(mediaId: string) {
  noStore();
  const data = await readCmsData();
  return data.media.find((asset) => asset.id === mediaId) ?? null;
}

export async function getCmsMediaAssetByIdWithUsage(mediaId: string): Promise<CmsMediaAssetWithUsage | null> {
  noStore();
  const data = await readCmsData();
  const asset = data.media.find((entry) => entry.id === mediaId);
  if (!asset) {
    return null;
  }
  return {
    ...asset,
    usageReferences: collectMediaUsageReferences(asset.url, data),
  };
}

export async function createCmsMediaAsset(input: CreateCmsMediaAssetInput) {
  const data = await readCmsData();
  const mediaId = input.id?.trim() || buildMediaAssetId(input.label);
  if (data.media.some((asset) => asset.id === mediaId)) {
    throw new Error("A media asset with this id already exists.");
  }

  const asset: CmsMediaAsset = {
    id: mediaId,
    label: input.label.trim(),
    kind: "image",
    url: input.url.trim(),
    altText: input.altText?.trim() || undefined,
    folder: input.folder.trim(),
    updatedAt: new Date().toISOString(),
  };

  data.media.unshift(asset);
  await writeCmsData(data);
  return asset;
}

export async function updateCmsMediaAsset(mediaId: string, input: UpdateCmsMediaAssetInput) {
  const data = await readCmsData();
  const asset = data.media.find((entry) => entry.id === mediaId);
  if (!asset) {
    throw new Error("Media asset not found.");
  }

  if (input.label !== undefined) {
    asset.label = input.label.trim();
  }
  if (input.url !== undefined) {
    asset.url = input.url.trim();
  }
  if (input.altText !== undefined) {
    asset.altText = input.altText.trim() || undefined;
  }
  if (input.folder !== undefined) {
    asset.folder = input.folder.trim();
  }
  asset.kind = "image";
  asset.updatedAt = new Date().toISOString();

  await writeCmsData(data);
  return asset;
}

export async function deleteCmsMediaAsset(mediaId: string) {
  const data = await readCmsData();
  const index = data.media.findIndex((entry) => entry.id === mediaId);
  if (index < 0) {
    throw new Error("Media asset not found.");
  }

  const asset = data.media[index];
  if (!asset) {
    throw new Error("Media asset not found.");
  }
  const usageReferences = collectMediaUsageReferences(asset.url, data);
  if (usageReferences.length > 0) {
    throw new Error("Cannot delete media asset while it is still referenced.");
  }

  data.media.splice(index, 1);
  await writeCmsData(data);
  return asset;
}
