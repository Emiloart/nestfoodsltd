import { unstable_noStore as noStore } from "next/cache";

import { readCmsData, writeCmsData } from "./store";
import { CMS_PAGE_SLUGS, type CmsPage, type CmsPageSlug } from "./types";

export async function getCmsPages() {
  noStore();
  const data = await readCmsData();
  return CMS_PAGE_SLUGS.map((slug) => data.pages[slug]);
}

export async function getCmsPage(slug: CmsPageSlug) {
  noStore();
  const data = await readCmsData();
  return data.pages[slug];
}

export async function updateCmsPage(slug: CmsPageSlug, input: Omit<CmsPage, "slug" | "updatedAt">) {
  const data = await readCmsData();
  const updatedPage: CmsPage = {
    slug,
    ...input,
    updatedAt: new Date().toISOString(),
  };
  data.pages[slug] = updatedPage;
  await writeCmsData(data);
  return updatedPage;
}
