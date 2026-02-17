import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { CUSTOMER_SEED_DATA } from "./seed";
import {
  type CustomerData,
  type CustomerNewsletterPreferences,
  type CustomerNotificationPreferences,
  type CustomerPreferences,
  type CustomerProfile,
} from "./types";

const relativeDataFilePath = path.join("data", "customer.json");

function resolveDataFilePath() {
  const candidates = [
    path.join(process.cwd(), relativeDataFilePath),
    path.join(process.cwd(), "apps", "web", relativeDataFilePath),
  ];
  const existingPath = candidates.find((candidatePath) => existsSync(candidatePath));
  return existingPath ?? candidates[0];
}

const dataFilePath = resolveDataFilePath();
const storageDriver = process.env.CUSTOMER_STORAGE_DRIVER ?? "json";

function uniqueStrings(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }
  const normalized = values.map((entry) => String(entry).trim()).filter(Boolean);
  return [...new Set(normalized)];
}

function normalizeNotifications(input: unknown): CustomerNotificationPreferences {
  if (!input || typeof input !== "object") {
    return {
      orderUpdates: true,
      marketingEmails: true,
      smsAlerts: false,
    };
  }

  const candidate = input as Partial<CustomerNotificationPreferences>;
  return {
    orderUpdates: candidate.orderUpdates ?? true,
    marketingEmails: candidate.marketingEmails ?? true,
    smsAlerts: candidate.smsAlerts ?? false,
  };
}

function normalizeNewsletter(input: unknown): CustomerNewsletterPreferences {
  if (!input || typeof input !== "object") {
    return {
      subscribed: true,
      topics: ["new-products"],
      frequency: "weekly",
    };
  }

  const candidate = input as Partial<CustomerNewsletterPreferences>;
  const frequencyOptions = new Set(["weekly", "biweekly", "monthly"]);
  const frequency = frequencyOptions.has(String(candidate.frequency))
    ? (candidate.frequency as CustomerNewsletterPreferences["frequency"])
    : "weekly";

  return {
    subscribed: candidate.subscribed ?? true,
    topics: uniqueStrings(candidate.topics),
    frequency,
  };
}

function normalizeProfile(input: unknown): CustomerProfile | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const candidate = input as Partial<CustomerProfile>;
  const email = candidate.email?.trim().toLowerCase();
  if (!email) {
    return null;
  }

  const now = new Date().toISOString();
  return {
    id: candidate.id?.trim() || crypto.randomUUID(),
    email,
    fullName: candidate.fullName?.trim() || undefined,
    phone: candidate.phone?.trim() || undefined,
    addresses: uniqueStrings(candidate.addresses),
    wishlistSlugs: uniqueStrings(candidate.wishlistSlugs),
    createdAt: candidate.createdAt ?? now,
    updatedAt: candidate.updatedAt ?? now,
  };
}

function normalizePreferences(input: unknown): CustomerPreferences | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const candidate = input as Partial<CustomerPreferences>;
  const customerEmail = candidate.customerEmail?.trim().toLowerCase();
  if (!customerEmail) {
    return null;
  }

  const localeOptions = new Set(["en-NG", "ha-NG", "yo-NG", "ig-NG", "fr-FR"]);
  const currencyOptions = new Set(["NGN", "USD"]);
  const locale = localeOptions.has(String(candidate.locale)) ? candidate.locale : "en-NG";
  const currency = currencyOptions.has(String(candidate.currency)) ? candidate.currency : "NGN";

  return {
    customerEmail,
    locale,
    currency,
    dietaryTags: uniqueStrings(candidate.dietaryTags),
    interests: uniqueStrings(candidate.interests),
    notifications: normalizeNotifications(candidate.notifications),
    newsletter: normalizeNewsletter(candidate.newsletter),
    updatedAt: candidate.updatedAt ?? new Date().toISOString(),
  };
}

function mergeCustomerData(input: Partial<CustomerData> | null | undefined): CustomerData {
  if (!input) {
    return structuredClone(CUSTOMER_SEED_DATA);
  }

  const profiles = (input.profiles ?? [])
    .map((entry) => normalizeProfile(entry))
    .filter((entry): entry is CustomerProfile => Boolean(entry));
  const preferences = (input.preferences ?? [])
    .map((entry) => normalizePreferences(entry))
    .filter((entry): entry is CustomerPreferences => Boolean(entry));
  const recommendations = Array.isArray(input.recommendations)
    ? input.recommendations.map((entry) => ({
        id: String(entry.id),
        type: entry.type === "recently_viewed" ? "recently_viewed" : "top_pick",
        productSlug: String(entry.productSlug),
        title: String(entry.title),
        reason: String(entry.reason),
      }))
    : [];
  const recentlyViewed = Array.isArray(input.recentlyViewed)
    ? input.recentlyViewed
        .map((entry) => {
          if (!entry || typeof entry !== "object") {
            return null;
          }
          const candidate = entry as Partial<CustomerData["recentlyViewed"][number]>;
          const customerEmail = candidate.customerEmail?.trim().toLowerCase();
          const productSlug = candidate.productSlug?.trim();
          if (!customerEmail || !productSlug) {
            return null;
          }
          return {
            id: candidate.id?.trim() || crypto.randomUUID(),
            customerEmail,
            productSlug,
            viewedAt: candidate.viewedAt ?? new Date().toISOString(),
          };
        })
        .filter((entry): entry is CustomerData["recentlyViewed"][number] => Boolean(entry))
    : [];

  const merged: CustomerData = {
    profiles: profiles.length > 0 ? profiles : CUSTOMER_SEED_DATA.profiles,
    preferences: preferences.length > 0 ? preferences : CUSTOMER_SEED_DATA.preferences,
    recommendations: recommendations.length > 0 ? recommendations : CUSTOMER_SEED_DATA.recommendations,
    recentlyViewed,
  };

  for (const profile of merged.profiles) {
    if (!merged.preferences.find((entry) => entry.customerEmail === profile.email)) {
      merged.preferences.push({
        customerEmail: profile.email,
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
      });
    }
  }

  return merged;
}

export async function readCustomerData(): Promise<CustomerData> {
  if (storageDriver !== "json") {
    throw new Error("CUSTOMER_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.");
  }

  try {
    const raw = await readFile(dataFilePath, "utf8");
    return mergeCustomerData(JSON.parse(raw) as Partial<CustomerData>);
  } catch {
    await writeCustomerData(CUSTOMER_SEED_DATA);
    return CUSTOMER_SEED_DATA;
  }
}

export async function writeCustomerData(data: CustomerData) {
  if (storageDriver !== "json") {
    throw new Error("CUSTOMER_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.");
  }

  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
