export type BlogArticle = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  updatedAt: string;
  imageUrl: string;
  tags: string[];
  sections: Array<{
    heading: string;
    body: string;
  }>;
};

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "enterprise-food-platform-roadmap-2026",
    title: "Nest Foods 2026 Enterprise Platform Roadmap",
    summary:
      "How Nest Foods is scaling catalog quality, traceability, and fulfillment readiness for multi-region growth.",
    publishedAt: "2026-02-10T09:00:00.000Z",
    updatedAt: "2026-02-12T10:30:00.000Z",
    imageUrl: "/placeholders/section-image-placeholder.svg",
    tags: ["operations", "technology", "expansion"],
    sections: [
      {
        heading: "Scaling with data discipline",
        body: "The 2026 roadmap prioritizes product data integrity, structured nutrition records, and clean media pipelines to support storefront quality across channels.",
      },
      {
        heading: "Fulfillment and trust",
        body: "Order lifecycle tracking and traceability lookup are being standardized to strengthen customer trust and reduce distributor turnaround time.",
      },
    ],
  },
  {
    slug: "food-traceability-standards-for-consumers-and-distributors",
    title: "Food Traceability Standards for Consumers and Distributors",
    summary:
      "A practical guide to batch-level visibility, certification timelines, and quality event documentation.",
    publishedAt: "2026-02-11T11:00:00.000Z",
    updatedAt: "2026-02-13T14:20:00.000Z",
    imageUrl: "/placeholders/section-image-placeholder.svg",
    tags: ["traceability", "quality", "b2b"],
    sections: [
      {
        heading: "From source to shelf",
        body: "Each product batch can be traced through sourcing, processing checkpoints, and compliance milestones to provide clear quality evidence.",
      },
      {
        heading: "Distributor confidence",
        body: "Structured traceability records simplify audits, reduce escalation cycles, and help sales teams close enterprise accounts faster.",
      },
    ],
  },
  {
    slug: "premium-ux-principles-for-food-commerce-growth",
    title: "Premium UX Principles for Food Commerce Growth",
    summary:
      "Design and interaction principles that improve conversion, repeat purchase behavior, and operational clarity.",
    publishedAt: "2026-02-12T08:00:00.000Z",
    updatedAt: "2026-02-15T16:10:00.000Z",
    imageUrl: "/placeholders/section-image-placeholder.svg",
    tags: ["ux", "commerce", "performance"],
    sections: [
      {
        heading: "Intent-first navigation",
        body: "High-intent tasks like product discovery, allergy filtering, and checkout progression are surfaced with clear hierarchy and low friction.",
      },
      {
        heading: "Performance by default",
        body: "Image behavior, feedback states, and loading strategies are tuned for speed so shoppers and distributors can act without waiting.",
      },
    ],
  },
];

export function listBlogArticles() {
  return BLOG_ARTICLES;
}

export function getBlogArticleBySlug(slug: string) {
  return BLOG_ARTICLES.find((entry) => entry.slug === slug) ?? null;
}
