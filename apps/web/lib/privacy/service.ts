import { unstable_noStore as noStore } from "next/cache";

import { readPrivacyData, writePrivacyData } from "./store";
import {
  type PrivacyConsentCategories,
  type PrivacyDataRequestType,
  type PrivacyDataRequestStatus,
} from "./types";

const MAX_CONSENT_RECORDS = 10_000;
const MAX_DATA_REQUESTS = 5_000;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export async function recordPrivacyConsent(input: {
  subjectId: string;
  locale?: string;
  source: "banner" | "privacy-page" | "api";
  categories: PrivacyConsentCategories;
  ipAddress?: string;
  userAgent?: string;
}) {
  const data = await readPrivacyData();
  const consent = {
    id: crypto.randomUUID(),
    subjectId: input.subjectId.trim(),
    locale: input.locale?.trim() || undefined,
    source: input.source,
    categories: input.categories,
    ipAddress: input.ipAddress?.trim() || undefined,
    userAgent: input.userAgent?.trim() || undefined,
    consentedAt: new Date().toISOString(),
  };

  data.consents.unshift(consent);
  if (data.consents.length > MAX_CONSENT_RECORDS) {
    data.consents = data.consents.slice(0, MAX_CONSENT_RECORDS);
  }

  await writePrivacyData(data);
  return consent;
}

export async function createPrivacyDataRequest(input: {
  email: string;
  type: PrivacyDataRequestType;
  fullName?: string;
  message?: string;
  status?: PrivacyDataRequestStatus;
}) {
  const data = await readPrivacyData();
  const now = new Date().toISOString();
  const request = {
    id: crypto.randomUUID(),
    email: normalizeEmail(input.email),
    fullName: input.fullName?.trim() || undefined,
    type: input.type,
    message: input.message?.trim() || undefined,
    status: input.status ?? "submitted",
    createdAt: now,
    updatedAt: now,
  };

  data.dataRequests.unshift(request);
  if (data.dataRequests.length > MAX_DATA_REQUESTS) {
    data.dataRequests = data.dataRequests.slice(0, MAX_DATA_REQUESTS);
  }

  await writePrivacyData(data);
  return request;
}

export async function listPrivacyDataRequests(filters?: {
  email?: string;
  type?: PrivacyDataRequestType;
  status?: PrivacyDataRequestStatus;
  limit?: number;
}) {
  noStore();
  const data = await readPrivacyData();
  let requests = [...data.dataRequests];

  if (filters?.email?.trim()) {
    const email = normalizeEmail(filters.email);
    requests = requests.filter((entry) => entry.email === email);
  }
  if (filters?.type) {
    requests = requests.filter((entry) => entry.type === filters.type);
  }
  if (filters?.status) {
    requests = requests.filter((entry) => entry.status === filters.status);
  }

  const limit = Math.min(Math.max(filters?.limit ?? 100, 1), 500);
  return requests.slice(0, limit);
}
