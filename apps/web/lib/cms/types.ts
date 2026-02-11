export type CmsPageSlug =
  | "home"
  | "about"
  | "vision"
  | "contact"
  | "careers"
  | "sustainability";

export type CmsPage = {
  slug: CmsPageSlug;
  title: string;
  headline: string;
  description: string;
  ctaPrimaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  updatedAt: string;
};

export type CmsData = {
  pages: Record<CmsPageSlug, CmsPage>;
};

export const CMS_PAGE_SLUGS: CmsPageSlug[] = [
  "home",
  "about",
  "vision",
  "contact",
  "careers",
  "sustainability",
];
