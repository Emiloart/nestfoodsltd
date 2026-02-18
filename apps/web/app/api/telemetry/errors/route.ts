import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { recordErrorEvent } from "@/lib/observability/service";
import {
  applyRateLimitHeaders,
  createRateLimitErrorResponse,
  evaluateRateLimit,
} from "@/lib/security/rate-limit";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

const errorTelemetryPayloadSchema = z.object({
  source: z.enum(["client", "server"]).default("client"),
  severity: z.enum(["info", "warning", "critical"]).default("warning"),
  message: z.string().min(1).max(1000),
  route: z.string().min(1).max(240).optional(),
  stack: z.string().max(8000).optional(),
  fingerprint: z.string().max(240).optional(),
});

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden origin." }, { status: 403 });
  }

  const ipAddress = resolveClientIp(request);
  const limitResult = evaluateRateLimit({
    bucket: "telemetry:errors",
    identifier: ipAddress,
    windowMs: 60_000,
    max: 60,
    blockDurationMs: 60_000,
  });
  if (!limitResult.allowed) {
    return createRateLimitErrorResponse(limitResult, "Too many error telemetry requests.");
  }

  const body = await request.json().catch(() => null);
  const validated = errorTelemetryPayloadSchema.safeParse(body);
  if (!validated.success) {
    const response = NextResponse.json({ error: "Invalid telemetry payload." }, { status: 400 });
    applyRateLimitHeaders(response, limitResult);
    return response;
  }

  const event = await recordErrorEvent({
    source: validated.data.source,
    severity: validated.data.severity,
    message: validated.data.message,
    route: validated.data.route,
    stack: validated.data.stack,
    fingerprint: validated.data.fingerprint,
    ipAddress,
    userAgent: resolveUserAgent(request),
  });

  const response = NextResponse.json({ ok: true, eventId: event.id }, { status: 202 });
  applyRateLimitHeaders(response, limitResult);
  return response;
}
