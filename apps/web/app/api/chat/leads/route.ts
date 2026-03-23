import { NextRequest, NextResponse } from "next/server";

import { logAuditEvent } from "@/lib/audit/service";
import { captureChatLead } from "@/lib/chat/service";
import {
  applyRateLimitHeaders,
  createRateLimitErrorResponse,
  evaluateRateLimit,
} from "@/lib/security/rate-limit";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

import { createChatLeadSchema } from "./schema";

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const rateLimitResult = evaluateRateLimit({
    bucket: "chat.lead.create",
    identifier: resolveClientIp(request),
    windowMs: 10 * 60 * 1000,
    max: 12,
    blockDurationMs: 10 * 60 * 1000,
  });
  if (!rateLimitResult.allowed) {
    void logAuditEvent({
      actorType: "anonymous",
      action: "chat.lead.create",
      outcome: "blocked",
      severity: "warning",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { reason: "rate_limited" },
    }).catch(() => null);
    return createRateLimitErrorResponse(
      rateLimitResult,
      "Support request limit exceeded. Please retry shortly.",
    );
  }

  const body = await request.json().catch(() => null);
  const validated = createChatLeadSchema.safeParse(body);
  if (!validated.success) {
    const response = NextResponse.json(
      { error: "Invalid chat lead payload.", details: validated.error.flatten() },
      { status: 400 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  }

  try {
    const result = await captureChatLead(validated.data);
    void logAuditEvent({
      actorType: "anonymous",
      action: "chat.lead.create",
      outcome: "success",
      severity: "info",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      resourceType: "chat.lead",
      resourceId: result.lead.id,
      details: {
        conversationId: result.conversationId,
        sourceIntent: result.lead.sourceIntent ?? "unknown",
      },
    }).catch(() => null);

    const response = NextResponse.json(
      {
        conversationId: result.conversationId,
        sessionId: result.sessionId,
        lead: result.lead,
      },
      { status: 201 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  } catch (error) {
    void logAuditEvent({
      actorType: "anonymous",
      action: "chat.lead.create",
      outcome: "failure",
      severity: "warning",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { reason: error instanceof Error ? error.message : "lead_capture_failed" },
    }).catch(() => null);

    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create support request." },
      { status: 400 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  }
}
