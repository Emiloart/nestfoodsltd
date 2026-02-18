import { NextRequest, NextResponse } from "next/server";

import { logAuditEvent } from "@/lib/audit/service";
import {
  applyRateLimitHeaders,
  createRateLimitErrorResponse,
  evaluateRateLimit,
} from "@/lib/security/rate-limit";
import { resolveClientIp, resolveUserAgent } from "@/lib/security/request";
import { lookupTraceabilityBatch } from "@/lib/traceability/service";

export async function GET(request: NextRequest) {
  const rateLimitResult = evaluateRateLimit({
    bucket: "traceability.lookup",
    identifier: resolveClientIp(request),
    windowMs: 60 * 1000,
    max: 60,
    blockDurationMs: 5 * 60 * 1000,
  });
  if (!rateLimitResult.allowed) {
    void logAuditEvent({
      actorType: "anonymous",
      action: "traceability.lookup",
      outcome: "blocked",
      severity: "warning",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { reason: "rate_limited" },
    }).catch(() => null);
    return createRateLimitErrorResponse(
      rateLimitResult,
      "Lookup rate limit exceeded. Please retry shortly.",
    );
  }

  const code = request.nextUrl.searchParams.get("code") ?? "";
  if (!code.trim()) {
    const response = NextResponse.json({ error: "Missing lookup code." }, { status: 400 });
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  }

  const batch = await lookupTraceabilityBatch(code);
  if (!batch) {
    const response = NextResponse.json({ error: "Batch not found.", batch: null }, { status: 404 });
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  }

  const response = NextResponse.json({ batch });
  applyRateLimitHeaders(response, rateLimitResult);
  return response;
}
