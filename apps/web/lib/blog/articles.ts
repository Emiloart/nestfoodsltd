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
    slug: "bread-production-consistency-at-scale",
    title: "Bread Production Consistency at Scale",
    summary:
      "How Nest Foods maintains dependable loaf quality across production planning, packaging, and distribution.",
    publishedAt: "2026-02-10T09:00:00.000Z",
    updatedAt: "2026-02-12T10:30:00.000Z",
    imageUrl: "/placeholders/section-image-placeholder.svg",
    tags: ["production", "quality", "operations"],
    sections: [
      {
        heading: "Production discipline",
        body: "Stable bread output depends on ingredient control, proofing consistency, packaging checks, and a public-facing product story that reflects those standards.",
      },
      {
        heading: "Retail confidence",
        body: "Consistent presentation across product pages, partner tooling, and quality routes improves trust for both shoppers and distributors.",
      },
    ],
  },
  {
    slug: "why-traceability-matters-in-bread-manufacturing",
    title: "Why Traceability Matters in Bread Manufacturing",
    summary:
      "A practical look at batch visibility, certification milestones, and production checkpoints for bread products.",
    publishedAt: "2026-02-11T11:00:00.000Z",
    updatedAt: "2026-02-13T14:20:00.000Z",
    imageUrl: "/placeholders/section-image-placeholder.svg",
    tags: ["traceability", "quality", "compliance"],
    sections: [
      {
        heading: "From flour source to finished loaf",
        body: "Each batch can be traced through sourcing, mixing, baking, packaging, QA release, and distribution to reinforce public trust.",
      },
      {
        heading: "Distributor confidence",
        body: "Structured traceability simplifies partner audits, shortens escalation loops, and strengthens supply conversations with approved distributors.",
      },
    ],
  },
  {
    slug: "designing-a-better-public-catalog-for-bread-products",
    title: "Designing a Better Public Catalog for Bread Products",
    summary:
      "How product hierarchy, restrained visuals, and quality-first messaging improve trust in a bread-manufacturer website.",
    publishedAt: "2026-02-12T08:00:00.000Z",
    updatedAt: "2026-02-15T16:10:00.000Z",
    imageUrl: "/placeholders/section-image-placeholder.svg",
    tags: ["ux", "catalog", "brand"],
    sections: [
      {
        heading: "Intent-first navigation",
        body: "Products, quality proof, and company trust should lead the public IA before account, cart, or operational tooling.",
      },
      {
        heading: "Corporate clarity",
        body: "Restrained layouts, clearer typography, and strong placeholder systems help the public site feel like a serious manufacturer rather than a generic storefront.",
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
