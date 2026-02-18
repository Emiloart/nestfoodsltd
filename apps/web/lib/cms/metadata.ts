import { type Metadata } from "next";

import { absoluteUrl } from "@/lib/seo/site";

import { type CmsPage } from "./types";

type CmsPageMetadataOptions = {
  path?: string;
};

export function cmsPageMetadata(page: CmsPage, options?: CmsPageMetadataOptions): Metadata {
  const canonicalPath = options?.path ?? (page.slug === "home" ? "/" : `/${page.slug}`);

  return {
    title: page.seo.title ?? page.title,
    description: page.seo.description ?? page.description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: page.seo.title ?? page.title,
      description: page.seo.description ?? page.description,
      url: absoluteUrl(canonicalPath),
      images: page.seo.ogImageUrl ? [{ url: absoluteUrl(page.seo.ogImageUrl) }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: page.seo.title ?? page.title,
      description: page.seo.description ?? page.description,
      images: page.seo.ogImageUrl ? [absoluteUrl(page.seo.ogImageUrl)] : undefined,
    },
  };
}
