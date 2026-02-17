import { type CurrencyCode } from "@/lib/commerce/types";

export type LocaleCode = "en-NG" | "ha-NG" | "yo-NG" | "ig-NG" | "fr-FR";

export type CustomerNotificationPreferences = {
  orderUpdates: boolean;
  marketingEmails: boolean;
  smsAlerts: boolean;
};

export type CustomerNewsletterPreferences = {
  subscribed: boolean;
  topics: string[];
  frequency: "weekly" | "biweekly" | "monthly";
};

export type CustomerProfile = {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  addresses: string[];
  wishlistSlugs: string[];
  createdAt: string;
  updatedAt: string;
};

export type CustomerPreferences = {
  customerEmail: string;
  locale: LocaleCode;
  currency: CurrencyCode;
  dietaryTags: string[];
  interests: string[];
  notifications: CustomerNotificationPreferences;
  newsletter: CustomerNewsletterPreferences;
  updatedAt: string;
};

export type CustomerRecommendation = {
  id: string;
  type: "recently_viewed" | "top_pick";
  productSlug: string;
  title: string;
  reason: string;
};

export type CustomerData = {
  profiles: CustomerProfile[];
  preferences: CustomerPreferences[];
  recommendations: CustomerRecommendation[];
  recentlyViewed: {
    id: string;
    customerEmail: string;
    productSlug: string;
    viewedAt: string;
  }[];
};
