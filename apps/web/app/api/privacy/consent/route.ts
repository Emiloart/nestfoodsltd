import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createPrivacySubjectId,
  decodePrivacyConsentCookie,
  encodePrivacyConsentCookie,
  PRIVACY_CONSENT_COOKIE_NAME,
  PRIVACY_SUBJECT_COOKIE_NAME,
} from "@/lib/privacy/consent-cookie";
import { recordPrivacyConsent } from "@/lib/privacy/service";
import {
  applyRateLimitHeaders,
  createRateLimitErrorResponse,
  evaluateRateLimit,
} from "@/lib/security/rate-limit";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

const consentSchema = z.object({
  categories: z.object({
    analytics: z.boolean().optional(),
    marketing: z.boolean().optional(),
    personalization: z.boolean().optional(),
  }),
  locale: z.string().trim().max(24).optional(),
  source: z.enum(["banner", "privacy-page", "api"]).optional(),
});

function consentCookieOptions() {
  return {
    httpOnly: false,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  };
}

function subjectCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
}

export async function GET(request: NextRequest) {
  const cookieValue = request.cookies.get(PRIVACY_CONSENT_COOKIE_NAME)?.value;
  const consent = decodePrivacyConsentCookie(cookieValue);
  return NextResponse.json({ consent });
}

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const rateLimitResult = evaluateRateLimit({
    bucket: "privacy.consent.update",
    identifier: resolveClientIp(request),
    windowMs: 10 * 60 * 1000,
    max: 20,
    blockDurationMs: 5 * 60 * 1000,
  });
  if (!rateLimitResult.allowed) {
    return createRateLimitErrorResponse(
      rateLimitResult,
      "Too many consent updates. Please retry shortly.",
    );
  }

  const body = await request.json().catch(() => null);
  const validated = consentSchema.safeParse(body);
  if (!validated.success) {
    const response = NextResponse.json(
      { error: "Invalid consent payload.", details: validated.error.flatten() },
      { status: 400 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  }

  const categories = {
    necessary: true as const,
    analytics: Boolean(validated.data.categories.analytics),
    marketing: Boolean(validated.data.categories.marketing),
    personalization: Boolean(validated.data.categories.personalization),
  };
  const consentedAt = new Date().toISOString();
  const subjectId =
    request.cookies.get(PRIVACY_SUBJECT_COOKIE_NAME)?.value || createPrivacySubjectId();

  const consent = await recordPrivacyConsent({
    subjectId,
    locale: validated.data.locale,
    source: validated.data.source ?? "api",
    categories,
    ipAddress: resolveClientIp(request),
    userAgent: resolveUserAgent(request),
  });

  const response = NextResponse.json({
    consent: {
      categories: consent.categories,
      consentedAt: consent.consentedAt,
    },
  });
  response.cookies.set(
    PRIVACY_CONSENT_COOKIE_NAME,
    encodePrivacyConsentCookie({ categories, consentedAt }),
    consentCookieOptions(),
  );
  response.cookies.set(PRIVACY_SUBJECT_COOKIE_NAME, subjectId, subjectCookieOptions());
  applyRateLimitHeaders(response, rateLimitResult);
  return response;
}
