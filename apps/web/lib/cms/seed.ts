import { type CmsData } from "./types";

const now = new Date().toISOString();

export const CMS_SEED_DATA: CmsData = {
  pages: {
    home: {
      slug: "home",
      title: "Nest Foods Ltd",
      headline: "Nest Foods Ltd digital platform for 2026 expansion.",
      description:
        "Modern, dynamic, and enterprise-ready foundation with clean architecture, premium UX, and operational scalability.",
      ctaPrimaryLabel: "Browse Products",
      ctaPrimaryHref: "/shop",
      ctaSecondaryLabel: "Open Admin",
      ctaSecondaryHref: "/admin",
      updatedAt: now,
    },
    about: {
      slug: "about",
      title: "About Nest Foods Ltd",
      headline: "A premium food brand building trusted nutrition at scale.",
      description:
        "This page is CMS-driven for brand story, leadership, trust signals, and operational milestones.",
      updatedAt: now,
    },
    vision: {
      slug: "vision",
      title: "Vision & Mission",
      headline: "Deliver world-class food products across Africa and beyond.",
      description:
        "This section is fully dynamic for mission statements, strategic pillars, and expansion roadmap content.",
      updatedAt: now,
    },
    contact: {
      slug: "contact",
      title: "Contact & Locations",
      headline: "Speak with Nest Foods Ltd teams across regions.",
      description:
        "Manage support channels, office details, map embeds, and inquiry routing from the admin workspace.",
      updatedAt: now,
    },
    careers: {
      slug: "careers",
      title: "Careers",
      headline: "Join the team shaping premium food experiences.",
      description:
        "This page supports dynamic openings, culture highlights, and role-specific application links.",
      updatedAt: now,
    },
    sustainability: {
      slug: "sustainability",
      title: "Sustainability",
      headline: "Responsible sourcing, production, and distribution.",
      description:
        "Publish transparent impact metrics, sourcing standards, and certification milestones.",
      updatedAt: now,
    },
  },
};
