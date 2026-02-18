import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logAuditEvent } from "@/lib/audit/service";
import { createPrivacyDataRequest } from "@/lib/privacy/service";
import {
  applyRateLimitHeaders,
  createRateLimitErrorResponse,
  evaluateRateLimit,
} from "@/lib/security/rate-limit";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

const dataRequestSchema = z.object({
  email: z.string().trim().email(),
  fullName: z.string().trim().max(160).optional(),
  type: z.enum(["export", "delete"]),
  message: z.string().trim().max(1200).optional(),
});

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const rateLimitResult = evaluateRateLimit({
    bucket: "privacy.data-request.create",
    identifier: resolveClientIp(request),
    windowMs: 24 * 60 * 60 * 1000,
    max: 5,
    blockDurationMs: 24 * 60 * 60 * 1000,
  });
  if (!rateLimitResult.allowed) {
    return createRateLimitErrorResponse(
      rateLimitResult,
      "Daily request limit reached. Please try again tomorrow.",
    );
  }

  const body = await request.json().catch(() => null);
  const validated = dataRequestSchema.safeParse(body);
  if (!validated.success) {
    const response = NextResponse.json(
      { error: "Invalid privacy data request payload.", details: validated.error.flatten() },
      { status: 400 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  }

  const dataRequest = await createPrivacyDataRequest(validated.data);
  const response = NextResponse.json({ dataRequest }, { status: 201 });
  applyRateLimitHeaders(response, rateLimitResult);

  void logAuditEvent({
    actorType: "customer",
    actorId: dataRequest.email,
    action: "privacy.data_request.create",
    resourceType: "privacy.data_request",
    resourceId: dataRequest.id,
    outcome: "success",
    severity: "info",
    ipAddress: resolveClientIp(request),
    userAgent: resolveUserAgent(request),
    details: { type: dataRequest.type },
  }).catch(() => null);

  return response;
}
