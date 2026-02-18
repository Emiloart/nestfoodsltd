import { type Metadata } from "next";

import { absoluteUrl } from "@/lib/seo/site";

const DEFAULT_OG_IMAGE = "/placeholders/section-image-placeholder.svg";

type BuildPageMetadataInput = {
  title: string;
  description: string;
  path: string;
  ogImageUrl?: string;
  noIndex?: boolean;
  openGraphType?: "website" | "article";
};

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const canonicalPath = normalizePath(input.path);
  const imageUrl = input.ogImageUrl ?? DEFAULT_OG_IMAGE;
  const robots = input.noIndex
    ? {
        index: false,
        follow: false,
      }
    : {
        index: true,
        follow: true,
      };

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: canonicalPath,
    },
    robots,
    openGraph: {
      type: input.openGraphType ?? "website",
      title: input.title,
      description: input.description,
      url: absoluteUrl(canonicalPath),
      siteName: "Nest Foods Ltd",
      images: [{ url: absoluteUrl(imageUrl) }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [absoluteUrl(imageUrl)],
    },
  };
}
