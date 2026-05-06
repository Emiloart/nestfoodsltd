import { unstable_noStore as noStore } from "next/cache";

import { readNewsletterData, writeNewsletterData } from "./store";

const MAX_SUBSCRIBERS = 20_000;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function subscribeToNewsletter(input: {
  email: string;
  fullName?: string;
  source?: string;
  consentMarketing: boolean;
}) {
  const data = await readNewsletterData();
  const email = normalizeEmail(input.email);
  const now = new Date().toISOString();
  const existing = data.subscribers.find((entry) => entry.email === email);

  if (existing) {
    existing.fullName = input.fullName?.trim() || existing.fullName;
    existing.source = input.source?.trim() || existing.source;
    existing.consentMarketing = input.consentMarketing;
    existing.createdAt = existing.createdAt || now;
    await writeNewsletterData(data);
    return { subscriber: existing, created: false };
  }

  const subscriber = {
    id: crypto.randomUUID(),
    email,
    fullName: input.fullName?.trim() || undefined,
    source: input.source?.trim() || "website",
    consentMarketing: input.consentMarketing,
    createdAt: now,
  };

  data.subscribers.unshift(subscriber);
  if (data.subscribers.length > MAX_SUBSCRIBERS) {
    data.subscribers = data.subscribers.slice(0, MAX_SUBSCRIBERS);
  }

  await writeNewsletterData(data);
  return { subscriber, created: true };
}

export async function listNewsletterSubscribers(limit = 100) {
  noStore();
  const data = await readNewsletterData();
  return data.subscribers.slice(0, Math.min(Math.max(limit, 1), 500));
}
