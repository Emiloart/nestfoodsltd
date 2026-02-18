import { unstable_noStore as noStore } from "next/cache";

import { readCustomerData, writeCustomerData } from "./store";
import { type CustomerPreferences, type CustomerProfile } from "./types";

type CustomerPreferencesUpdateInput = {
  locale?: CustomerPreferences["locale"];
  currency?: CustomerPreferences["currency"];
  dietaryTags?: string[];
  interests?: string[];
  notifications?: Partial<CustomerPreferences["notifications"]>;
  newsletter?: Partial<CustomerPreferences["newsletter"]> & {
    topics?: string[];
  };
};

export const CUSTOMER_SESSION_COOKIE_NAME = "nest_customer_email";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((entry) => entry.trim()).filter(Boolean))];
}

function defaultCustomerPreferences(email: string): CustomerPreferences {
  return {
    customerEmail: email,
    locale: "en-NG",
    currency: "NGN",
    dietaryTags: [],
    interests: ["new-products"],
    notifications: {
      orderUpdates: true,
      marketingEmails: true,
      smsAlerts: false,
    },
    newsletter: {
      subscribed: true,
      topics: ["new-products"],
      frequency: "weekly",
    },
    updatedAt: new Date().toISOString(),
  };
}

export async function getCustomerProfileByEmail(email: string) {
  noStore();
  const normalized = normalizeEmail(email);
  const data = await readCustomerData();
  return data.profiles.find((entry) => entry.email === normalized) ?? null;
}

export async function createOrGetCustomerProfile(email: string, fullName?: string) {
  const normalized = normalizeEmail(email);
  const data = await readCustomerData();
  const existing = data.profiles.find((entry) => entry.email === normalized);
  if (existing) {
    if (fullName?.trim() && !existing.fullName) {
      existing.fullName = fullName.trim();
      existing.updatedAt = new Date().toISOString();
      await writeCustomerData(data);
    }
    return existing;
  }

  const now = new Date().toISOString();
  const profile: CustomerProfile = {
    id: crypto.randomUUID(),
    email: normalized,
    fullName: fullName?.trim() || undefined,
    addresses: [],
    wishlistSlugs: [],
    createdAt: now,
    updatedAt: now,
  };
  data.profiles.push(profile);
  data.preferences.push(defaultCustomerPreferences(normalized));
  await writeCustomerData(data);
  return profile;
}

export async function updateCustomerProfile(
  email: string,
  input: { fullName?: string; phone?: string; addresses?: string[] },
) {
  const data = await readCustomerData();
  const normalized = normalizeEmail(email);
  const profile = data.profiles.find((entry) => entry.email === normalized);
  if (!profile) {
    throw new Error("Customer profile not found.");
  }

  profile.fullName = input.fullName?.trim() || profile.fullName;
  profile.phone = input.phone?.trim() || profile.phone;
  if (input.addresses) {
    profile.addresses = uniqueStrings(input.addresses);
  }
  profile.updatedAt = new Date().toISOString();
  await writeCustomerData(data);
  return profile;
}

export async function getCustomerPreferences(email: string) {
  noStore();
  const normalized = normalizeEmail(email);
  const data = await readCustomerData();
  return (
    data.preferences.find((entry) => entry.customerEmail === normalized) ??
    defaultCustomerPreferences(normalized)
  );
}

export async function updateCustomerPreferences(
  email: string,
  input: CustomerPreferencesUpdateInput,
) {
  const data = await readCustomerData();
  const normalized = normalizeEmail(email);
  let prefs = data.preferences.find((entry) => entry.customerEmail === normalized);

  if (!prefs) {
    prefs = defaultCustomerPreferences(normalized);
    data.preferences.push(prefs);
  }

  if (input.locale) {
    prefs.locale = input.locale;
  }
  if (input.currency) {
    prefs.currency = input.currency;
  }
  if (input.dietaryTags) {
    prefs.dietaryTags = uniqueStrings(input.dietaryTags);
  }
  if (input.interests) {
    prefs.interests = uniqueStrings(input.interests);
  }
  if (input.notifications) {
    prefs.notifications = {
      ...prefs.notifications,
      ...input.notifications,
    };
  }
  if (input.newsletter) {
    prefs.newsletter = {
      ...prefs.newsletter,
      ...input.newsletter,
      topics: input.newsletter.topics
        ? uniqueStrings(input.newsletter.topics)
        : prefs.newsletter.topics,
    };
  }

  prefs.updatedAt = new Date().toISOString();
  await writeCustomerData(data);
  return prefs;
}

export async function listCustomerWishlistSlugs(email: string) {
  noStore();
  const profile = await getCustomerProfileByEmail(email);
  return profile?.wishlistSlugs ?? [];
}

export async function addToCustomerWishlist(email: string, productSlug: string) {
  const normalized = normalizeEmail(email);
  const data = await readCustomerData();
  const profile =
    data.profiles.find((entry) => entry.email === normalized) ??
    ({
      id: crypto.randomUUID(),
      email: normalized,
      addresses: [],
      wishlistSlugs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } satisfies CustomerProfile);

  if (!data.profiles.find((entry) => entry.email === normalized)) {
    data.profiles.push(profile);
  }
  if (!data.preferences.find((entry) => entry.customerEmail === normalized)) {
    data.preferences.push(defaultCustomerPreferences(normalized));
  }

  profile.wishlistSlugs = uniqueStrings([...profile.wishlistSlugs, productSlug]);
  profile.updatedAt = new Date().toISOString();
  await writeCustomerData(data);
  return profile.wishlistSlugs;
}

export async function removeFromCustomerWishlist(email: string, productSlug: string) {
  const normalized = normalizeEmail(email);
  const data = await readCustomerData();
  const profile = data.profiles.find((entry) => entry.email === normalized);
  if (!profile) {
    return [];
  }

  profile.wishlistSlugs = profile.wishlistSlugs.filter((entry) => entry !== productSlug);
  profile.updatedAt = new Date().toISOString();
  await writeCustomerData(data);
  return profile.wishlistSlugs;
}

export async function trackCustomerRecentlyViewed(email: string, productSlug: string) {
  const normalized = normalizeEmail(email);
  const data = await readCustomerData();
  const now = new Date().toISOString();

  const remaining = data.recentlyViewed.filter(
    (entry) => !(entry.customerEmail === normalized && entry.productSlug === productSlug),
  );
  data.recentlyViewed = [
    {
      id: crypto.randomUUID(),
      customerEmail: normalized,
      productSlug,
      viewedAt: now,
    },
    ...remaining,
  ].slice(0, 200);

  await writeCustomerData(data);
  return data.recentlyViewed.filter((entry) => entry.customerEmail === normalized);
}

export async function listCustomerRecentlyViewedSlugs(email: string, limit = 8) {
  noStore();
  const normalized = normalizeEmail(email);
  const data = await readCustomerData();
  return data.recentlyViewed
    .filter((entry) => entry.customerEmail === normalized)
    .sort((a, b) => (a.viewedAt < b.viewedAt ? 1 : -1))
    .map((entry) => entry.productSlug)
    .filter((slug, index, all) => all.indexOf(slug) === index)
    .slice(0, limit);
}

export async function getCustomerRecommendations(email?: string) {
  noStore();
  const data = await readCustomerData();
  if (!email) {
    return data.recommendations;
  }
  const normalized = normalizeEmail(email);
  const profile = data.profiles.find((entry) => entry.email === normalized);
  const prefs = data.preferences.find((entry) => entry.customerEmail === normalized);
  const recentlyViewed = data.recentlyViewed
    .filter((entry) => entry.customerEmail === normalized)
    .sort((a, b) => (a.viewedAt < b.viewedAt ? 1 : -1))
    .slice(0, 3)
    .map((entry, index) => ({
      id: `recently-viewed-${index + 1}`,
      type: "recently_viewed" as const,
      productSlug: entry.productSlug,
      title: "Continue browsing",
      reason: "Based on your recently viewed products.",
    }));

  const wishlistBoost = (profile?.wishlistSlugs ?? []).slice(0, 2).map((slug, index) => ({
    id: `wishlist-pick-${index + 1}`,
    type: "top_pick" as const,
    productSlug: slug,
    title: "From your wishlist",
    reason: "Saved by you for future purchase.",
  }));

  let boosted = [...recentlyViewed, ...wishlistBoost, ...data.recommendations];
  if (prefs?.interests.includes("bulk-offers")) {
    boosted = boosted.sort(
      (a, b) =>
        Number(b.productSlug.includes("protein")) - Number(a.productSlug.includes("protein")),
    );
  }

  const seen = new Set<string>();
  return boosted.filter((entry) => {
    if (seen.has(entry.productSlug)) {
      return false;
    }
    seen.add(entry.productSlug);
    return true;
  });
}
