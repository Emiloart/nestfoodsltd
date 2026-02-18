import { type PrivacyConsentCategories } from "./types";

export const PRIVACY_CONSENT_COOKIE_NAME = "nest_privacy_consent";
export const PRIVACY_SUBJECT_COOKIE_NAME = "nest_privacy_subject";

export type PrivacyConsentCookiePayload = {
  categories: PrivacyConsentCategories;
  consentedAt: string;
};

export function createPrivacySubjectId() {
  return crypto.randomUUID();
}

export function encodePrivacyConsentCookie(value: PrivacyConsentCookiePayload) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

export function decodePrivacyConsentCookie(
  value?: string | null,
): PrivacyConsentCookiePayload | null {
  if (!value?.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as {
      categories?: Partial<PrivacyConsentCategories>;
      consentedAt?: string;
    };
    if (!parsed?.consentedAt || !parsed.categories) {
      return null;
    }

    return {
      categories: {
        necessary: true,
        analytics: Boolean(parsed.categories.analytics),
        marketing: Boolean(parsed.categories.marketing),
        personalization: Boolean(parsed.categories.personalization),
      },
      consentedAt: parsed.consentedAt,
    };
  } catch {
    return null;
  }
}
