import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logAuditEvent } from "@/lib/audit/service";
import { createB2BSessionToken, getB2BSessionAccountId } from "@/lib/b2b/session";
import {
  B2B_SESSION_COOKIE_NAME,
  createOrGetB2BAccount,
  getB2BAccountById,
} from "@/lib/b2b/service";
import {
  applyRateLimitHeaders,
  createRateLimitErrorResponse,
  evaluateRateLimit,
} from "@/lib/security/rate-limit";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

const sessionSchema = z.object({
  companyName: z.string().trim().min(2).max(140),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(40).optional(),
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

function logB2BSessionEvent(
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
    actorType: input.actorId ? "b2b" : "anonymous",
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
  const accountId = getB2BSessionAccountId(request);
  if (!accountId) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const account = await getB2BAccountById(accountId);
  if (!account) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, account });
}

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    logB2BSessionEvent(request, {
      action: "b2b.session.login",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const rateLimitResult = evaluateRateLimit({
    bucket: "b2b.session.login",
    identifier: resolveClientIp(request),
    windowMs: 10 * 60 * 1000,
    max: 6,
    blockDurationMs: 20 * 60 * 1000,
  });
  if (!rateLimitResult.allowed) {
    logB2BSessionEvent(request, {
      action: "b2b.session.login",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "rate_limited" },
    });
    return createRateLimitErrorResponse(
      rateLimitResult,
      "Too many B2B sign-in attempts. Please retry later.",
    );
  }

  const body = await request.json().catch(() => null);
  const validated = sessionSchema.safeParse(body);
  if (!validated.success) {
    logB2BSessionEvent(request, {
      action: "b2b.session.login",
      outcome: "failure",
      severity: "warning",
      details: { reason: "invalid_payload" },
    });
    return NextResponse.json(
      { error: "Invalid B2B sign-in payload", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  const account = await createOrGetB2BAccount(validated.data);
  const response = NextResponse.json({ authenticated: true, account });
  response.cookies.set(B2B_SESSION_COOKIE_NAME, createB2BSessionToken(account.id), cookieOptions());
  applyRateLimitHeaders(response, rateLimitResult);
  logB2BSessionEvent(request, {
    actorId: account.id,
    action: "b2b.session.login",
    outcome: "success",
    severity: "info",
    details: { companyName: account.companyName },
  });
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    logB2BSessionEvent(request, {
      action: "b2b.session.logout",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const accountId = getB2BSessionAccountId(request);
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(B2B_SESSION_COOKIE_NAME, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
  logB2BSessionEvent(request, {
    actorId: accountId ?? undefined,
    action: "b2b.session.logout",
    outcome: "success",
    severity: "info",
  });
  return response;
}
