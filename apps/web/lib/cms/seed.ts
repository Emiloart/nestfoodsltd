import { type CmsData } from "./types";

const now = new Date().toISOString();

export const CMS_SEED_DATA: CmsData = {
  pages: {
    home: {
      slug: "home",
      title: "Nest Foods Ltd",
      headline: "Premium bread production built on quality, consistency, and trust.",
      description:
        "Nest Foods Ltd presents a manufacturer-first public experience focused on dependable bread products, production standards, company credibility, and clear contact routes.",
      status: "published",
      publishAt: now,
      ctaPrimaryLabel: "Explore Products",
      ctaPrimaryHref: "/shop",
      ctaSecondaryLabel: "Quality Standards",
      ctaSecondaryHref: "/quality",
      heroMediaKind: "image",
      heroImageUrl: "/placeholders/hero/hero-image-placeholder.svg",
      heroVideoPosterUrl: "/placeholders/hero/hero-video-poster-placeholder.svg",
      logoImageUrl: "/brand/logos/logo-primary.svg",
      seo: {
        title: "Nest Foods Ltd | Premium Bread Manufacturer",
        description:
          "Premium bread manufacturing, production standards, and product information for communities and partners across Africa.",
        ogImageUrl: "/placeholders/hero/hero-image-placeholder.svg",
      },
      updatedAt: now,
      revisions: [],
    },
    about: {
      slug: "about",
      title: "About Nest Foods Ltd",
      headline: "A bread manufacturer built to earn trust through daily consistency.",
      description:
        "This CMS-driven page supports brand story, manufacturing credibility, leadership narrative, and the operational milestones behind trusted bread supply.",
      status: "published",
      publishAt: now,
      heroMediaKind: "image",
      heroImageUrl: "/placeholders/sections/section-image-placeholder.svg",
      logoImageUrl: "/brand/logos/logo-primary.svg",
      seo: {
        title: "About Nest Foods Ltd",
        description: "Learn about Nest Foods Ltd mission, values, and growth strategy.",
        ogImageUrl: "/placeholders/sections/section-image-placeholder.svg",
      },
      updatedAt: now,
      revisions: [],
    },
    vision: {
      slug: "vision",
      title: "Vision & Mission",
      headline:
        "Build a trusted African bread brand rooted in safe production and reliable distribution.",
      description:
        "This section remains fully dynamic for mission statements, strategic pillars, expansion planning, and long-term quality commitments.",
      status: "published",
      publishAt: now,
      heroMediaKind: "image",
      heroImageUrl: "/placeholders/sections/section-image-placeholder.svg",
      logoImageUrl: "/brand/logos/logo-primary.svg",
      seo: {
        title: "Vision & Mission | Nest Foods Ltd",
        description: "Explore the long-term vision and strategic mission behind Nest Foods Ltd.",
        ogImageUrl: "/placeholders/sections/section-image-placeholder.svg",
      },
      updatedAt: now,
      revisions: [],
    },
    contact: {
      slug: "contact",
      title: "Contact & Locations",
      headline:
        "Speak with Nest Foods teams about products, partnerships, and production questions.",
      description:
        "Use this page for office details, product enquiries, distributor introductions, and direct contact with Nest Foods teams.",
      status: "published",
      publishAt: now,
      heroMediaKind: "image",
      heroImageUrl: "/placeholders/sections/section-image-placeholder.svg",
      logoImageUrl: "/brand/logos/logo-primary.svg",
      seo: {
        title: "Contact Nest Foods Ltd",
        description:
          "Reach Nest Foods Ltd teams and offices for enquiries, support, and partnerships.",
        ogImageUrl: "/placeholders/sections/section-image-placeholder.svg",
      },
      updatedAt: now,
      revisions: [],
    },
    careers: {
      slug: "careers",
      title: "Careers",
      headline: "Join the teams shaping production, quality, and reliable distribution.",
      description:
        "This page supports dynamic openings across production, quality assurance, operations, commercial, and support roles.",
      status: "published",
      publishAt: now,
      heroMediaKind: "image",
      heroImageUrl: "/placeholders/sections/section-image-placeholder.svg",
      logoImageUrl: "/brand/logos/logo-primary.svg",
      seo: {
        title: "Careers at Nest Foods Ltd",
        description: "Build your career with an ambitious food manufacturing platform.",
        ogImageUrl: "/placeholders/sections/section-image-placeholder.svg",
      },
      updatedAt: now,
      revisions: [],
    },
    sustainability: {
      slug: "sustainability",
      title: "Sustainability",
      headline: "Responsible sourcing, efficient baking, and accountable distribution.",
      description:
        "Publish transparent impact metrics, sourcing standards, packaging improvements, and certification milestones.",
      status: "published",
      publishAt: now,
      heroMediaKind: "image",
      heroImageUrl: "/placeholders/sections/section-image-placeholder.svg",
      logoImageUrl: "/brand/logos/logo-primary.svg",
      seo: {
        title: "Sustainability | Nest Foods Ltd",
        description: "Track sustainability commitments and measurable impact initiatives.",
        ogImageUrl: "/placeholders/sections/section-image-placeholder.svg",
      },
      updatedAt: now,
      revisions: [],
    },
  },
  banners: [
    {
      id: "banner-home-1",
      label: "Need Guidance?",
      headline:
        "Review product details, company information, and contact options from one public experience.",
      ctaLabel: "Contact Team",
      ctaHref: "/contact",
      imageUrl: "/placeholders/hero/hero-image-placeholder.svg",
      status: "published",
      publishAt: now,
      order: 1,
      updatedAt: now,
    },
  ],
  media: [
    {
      id: "media-logo-primary",
      label: "Primary Logo Placeholder",
      kind: "image",
      url: "/brand/logos/logo-primary.svg",
      altText: "Nest Foods Ltd logo placeholder",
      folder: "branding",
      updatedAt: now,
    },
    {
      id: "media-hero-default",
      label: "Hero Image Placeholder",
      kind: "image",
      url: "/placeholders/hero/hero-image-placeholder.svg",
      altText: "Hero image placeholder",
      folder: "homepage",
      updatedAt: now,
    },
    {
      id: "media-hero-video-poster",
      label: "Hero Video Poster Placeholder",
      kind: "image",
      url: "/placeholders/hero/hero-video-poster-placeholder.svg",
      altText: "Hero video poster placeholder",
      folder: "homepage",
      updatedAt: now,
    },
  ],
  products: [
    {
      id: "prod-placeholder-1",
      name: "Signature Blend Placeholder",
      slug: "signature-blend-placeholder",
      status: "published",
      imageUrl: "/placeholders/products/product-placeholder.svg",
      nutritionSummary: "Nutritional values will be configured in catalog manager.",
      allergens: ["None configured"],
      updatedAt: now,
    },
  ],
  recipes: [
    {
      id: "recipe-placeholder-1",
      title: "Recipe Placeholder",
      slug: "recipe-placeholder",
      status: "draft",
      imageUrl: "/placeholders/sections/section-image-placeholder.svg",
      ingredients: ["Ingredient data will be configured in admin."],
      updatedAt: now,
    },
  ],
};
