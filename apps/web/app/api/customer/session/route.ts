import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logAuditEvent } from "@/lib/audit/service";
import { createOrGetCustomerProfile, CUSTOMER_SESSION_COOKIE_NAME } from "@/lib/customer/service";
import { createCustomerSessionToken, getCustomerSessionEmail } from "@/lib/customer/session";
import {
  applyRateLimitHeaders,
  createRateLimitErrorResponse,
  evaluateRateLimit,
} from "@/lib/security/rate-limit";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

const sessionSchema = z.object({
  email: z.string().trim().email(),
  fullName: z.string().trim().max(120).optional(),
});

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

function logCustomerSessionEvent(
  request: NextRequest,
  input: {
    actorId?: string;
    action: string;
    outcome: "success" | "failure" | "blocked";
    severity: "info" | "warning" | "critical";
    details?: Record<string, unknown>;
  },
) {
  void logAuditEvent({
    actorType: input.actorId ? "customer" : "anonymous",
    actorId: input.actorId,
    action: input.action,
    outcome: input.outcome,
    severity: input.severity,
    ipAddress: resolveClientIp(request),
    userAgent: resolveUserAgent(request),
    details: input.details,
  }).catch(() => null);
}

export async function GET(request: NextRequest) {
  const email = getCustomerSessionEmail(request);
  if (!email) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const profile = await createOrGetCustomerProfile(email);
  return NextResponse.json({ authenticated: true, profile });
}

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    logCustomerSessionEvent(request, {
      action: "customer.session.login",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const rateLimitResult = evaluateRateLimit({
    bucket: "customer.session.login",
    identifier: resolveClientIp(request),
    windowMs: 10 * 60 * 1000,
    max: 8,
    blockDurationMs: 15 * 60 * 1000,
  });
  if (!rateLimitResult.allowed) {
    logCustomerSessionEvent(request, {
      action: "customer.session.login",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "rate_limited" },
    });
    return createRateLimitErrorResponse(
      rateLimitResult,
      "Too many sign-in attempts. Please retry later.",
    );
  }

  const body = await request.json().catch(() => null);
  const validated = sessionSchema.safeParse(body);
  if (!validated.success) {
    logCustomerSessionEvent(request, {
      action: "customer.session.login",
      outcome: "failure",
      severity: "warning",
      details: { reason: "invalid_payload" },
    });
    return NextResponse.json({ error: "Invalid session payload" }, { status: 400 });
  }

  const profile = await createOrGetCustomerProfile(validated.data.email, validated.data.fullName);
  const response = NextResponse.json({ authenticated: true, profile });
  response.cookies.set(
    CUSTOMER_SESSION_COOKIE_NAME,
    createCustomerSessionToken(profile.email),
    cookieOptions(),
  );
  applyRateLimitHeaders(response, rateLimitResult);
  logCustomerSessionEvent(request, {
    actorId: profile.email,
    action: "customer.session.login",
    outcome: "success",
    severity: "info",
  });
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    logCustomerSessionEvent(request, {
      action: "customer.session.logout",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const email = request.cookies.get(CUSTOMER_SESSION_COOKIE_NAME)?.value;
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(CUSTOMER_SESSION_COOKIE_NAME, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
  logCustomerSessionEvent(request, {
    actorId: email ?? undefined,
    action: "customer.session.logout",
    outcome: "success",
    severity: "info",
  });
  return response;
}
