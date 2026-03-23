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
      wishlistSlugs: ["whole-wheat-loaf"],
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
      productSlug: "classic-sandwich-loaf",
      title: "Classic Sandwich Loaf",
      reason: "Popular among repeat bread buyers in Lagos.",
    },
    {
      id: "rec-0002",
      type: "top_pick",
      productSlug: "butter-top-loaf",
      title: "Butter Top Loaf",
      reason: "Premium shelf presentation for households and retail partners.",
    },
  ],
  recentlyViewed: [
    {
      id: "rv-0001",
      customerEmail: "customer@example.com",
      productSlug: "classic-sandwich-loaf",
      viewedAt: now,
    },
  ],
};
