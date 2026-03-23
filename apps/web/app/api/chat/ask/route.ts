import { NextRequest, NextResponse } from "next/server";

import { logAuditEvent } from "@/lib/audit/service";
import { askChatAgent } from "@/lib/chat/service";
import {
  applyRateLimitHeaders,
  createRateLimitErrorResponse,
  evaluateRateLimit,
} from "@/lib/security/rate-limit";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

import { askChatSchema } from "./schema";

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const rateLimitResult = evaluateRateLimit({
    bucket: "chat.ask",
    identifier: resolveClientIp(request),
    windowMs: 60 * 1000,
    max: 40,
    blockDurationMs: 3 * 60 * 1000,
  });
  if (!rateLimitResult.allowed) {
    void logAuditEvent({
      actorType: "anonymous",
      action: "chat.ask",
      outcome: "blocked",
      severity: "warning",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { reason: "rate_limited" },
    }).catch(() => null);
    return createRateLimitErrorResponse(
      rateLimitResult,
      "Chat rate limit exceeded. Please retry shortly.",
    );
  }

  const body = await request.json().catch(() => null);
  const validated = askChatSchema.safeParse(body);
  if (!validated.success) {
    const response = NextResponse.json(
      { error: "Invalid chat request payload.", details: validated.error.flatten() },
      { status: 400 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  }

  try {
    const result = await askChatAgent(validated.data);
    void logAuditEvent({
      actorType: "anonymous",
      action: "chat.ask",
      outcome: "success",
      severity: "info",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      resourceType: "chat.conversation",
      resourceId: result.conversationId,
      details: {
        intent: result.intent,
        confidence: Number(result.confidence.toFixed(2)),
        handoffSuggested: result.handoffSuggested,
      },
    }).catch(() => null);

    const response = NextResponse.json(result, { status: 200 });
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  } catch (error) {
    void logAuditEvent({
      actorType: "anonymous",
      action: "chat.ask",
      outcome: "failure",
      severity: "warning",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { reason: error instanceof Error ? error.message : "chat_processing_failed" },
    }).catch(() => null);

    const response = NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process chat request.",
      },
      { status: 400 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  }
}
