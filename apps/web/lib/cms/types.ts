import { type AdminRole } from "@/lib/admin/auth";

export type CmsPageSlug =
  | "home"
  | "about"
  | "vision"
  | "contact"
  | "careers"
  | "sustainability";

export type CmsPublicationStatus = "draft" | "published" | "scheduled";

export type CmsSeo = {
  title?: string;
  description?: string;
  ogImageUrl?: string;
};

export type CmsPageRevision = {
  id: string;
  updatedAt: string;
  updatedByRole: AdminRole;
  snapshot: Omit<CmsPage, "revisions">;
};

export type CmsPage = {
  slug: CmsPageSlug;
  title: string;
  headline: string;
  description: string;
  status: CmsPublicationStatus;
  publishAt?: string;
  ctaPrimaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  heroImageUrl?: string;
  logoImageUrl?: string;
  seo: CmsSeo;
  updatedAt: string;
  revisions: CmsPageRevision[];
};

export type CmsBanner = {
  id: string;
  label: string;
  headline: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl: string;
  status: CmsPublicationStatus;
  publishAt?: string;
  order: number;
  updatedAt: string;
};

export type CmsMediaAsset = {
  id: string;
  label: string;
  kind: "image";
  url: string;
  altText?: string;
  folder: string;
  updatedAt: string;
};

export type CmsProductModel = {
  id: string;
  name: string;
  slug: string;
  status: CmsPublicationStatus;
  imageUrl: string;
  nutritionSummary: string;
  allergens: string[];
  updatedAt: string;
};

export type CmsRecipeModel = {
  id: string;
  title: string;
  slug: string;
  status: CmsPublicationStatus;
  imageUrl: string;
  ingredients: string[];
  updatedAt: string;
};

export type CmsData = {
  pages: Record<CmsPageSlug, CmsPage>;
  banners: CmsBanner[];
  media: CmsMediaAsset[];
  products: CmsProductModel[];
  recipes: CmsRecipeModel[];
};

export const CMS_PAGE_SLUGS: CmsPageSlug[] = [
  "home",
  "about",
  "vision",
  "contact",
  "careers",
  "sustainability",
];
