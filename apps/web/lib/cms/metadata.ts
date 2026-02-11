import { type Metadata } from "next";

import { type CmsPage } from "./types";

export function cmsPageMetadata(page: CmsPage): Metadata {
  return {
    title: page.seo.title ?? page.title,
    description: page.seo.description ?? page.description,
    openGraph: {
      title: page.seo.title ?? page.title,
      description: page.seo.description ?? page.description,
      images: page.seo.ogImageUrl ? [page.seo.ogImageUrl] : undefined,
    },
  };
}
