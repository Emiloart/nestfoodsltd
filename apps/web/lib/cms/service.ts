import { unstable_noStore as noStore } from "next/cache";

import { type AdminRole } from "@/lib/admin/auth";

import { CMS_SEED_DATA } from "./seed";
import { readCmsData, writeCmsData } from "./store";
import { CMS_PAGE_SLUGS, type CmsPage, type CmsPageSlug } from "./types";

function isLivePage(page: CmsPage) {
  if (page.status === "published") {
    return true;
  }

  if (page.status === "scheduled" && page.publishAt) {
    return new Date(page.publishAt) <= new Date();
  }

  return false;
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
