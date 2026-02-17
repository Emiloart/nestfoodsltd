import { type CustomerData } from "./types";

const now = new Date().toISOString();

export const CUSTOMER_SEED_DATA: CustomerData = {
  profiles: [
    {
      id: "cust-0001",
      email: "customer@example.com",
      fullName: "Demo Customer",
      phone: "+2348000000000",
      addresses: ["Lekki Phase 1, Lagos, Nigeria"],
      wishlistSlugs: ["super-breakfast-cereal"],
      createdAt: now,
      updatedAt: now,
    },
  ],
  preferences: [
    {
      customerEmail: "customer@example.com",
      locale: "en-NG",
      currency: "NGN",
      dietaryTags: ["high-protein"],
      interests: ["new-products", "recipes", "bulk-offers"],
      notifications: {
        orderUpdates: true,
        marketingEmails: true,
        smsAlerts: false,
      },
      newsletter: {
        subscribed: true,
        topics: ["new-products", "recipes"],
        frequency: "weekly",
      },
      updatedAt: now,
    },
  ],
  recommendations: [
    {
      id: "rec-0001",
      type: "top_pick",
      productSlug: "signature-jollof-rice-mix",
      title: "Signature Jollof Rice Mix",
      reason: "Popular among repeat customers in Lagos.",
    },
    {
      id: "rec-0002",
      type: "top_pick",
      productSlug: "plant-protein-granules",
      title: "Plant Protein Granules",
      reason: "High-protein staple for home and B2B buyers.",
    },
  ],
  recentlyViewed: [
    {
      id: "rv-0001",
      customerEmail: "customer@example.com",
      productSlug: "signature-jollof-rice-mix",
      viewedAt: now,
    },
  ],
};
