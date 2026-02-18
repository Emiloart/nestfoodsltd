import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logAuditEvent } from "@/lib/audit/service";
import { createOrder, createPaymentSession } from "@/lib/commerce/service";
import {
  applyRateLimitHeaders,
  createRateLimitErrorResponse,
  evaluateRateLimit,
} from "@/lib/security/rate-limit";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

const checkoutSchema = z.object({
  customerEmail: z.string().trim().email(),
  customerName: z.string().trim().max(120).optional(),
  shippingAddress: z.string().trim().min(8).max(300),
  notes: z.string().trim().max(500).optional(),
  items: z
    .array(
      z.object({
        variantId: z.string().trim().min(3),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1),
  promoCode: z.string().trim().max(30).optional(),
  deliverySlotId: z.string().trim().max(100).optional(),
  paymentProvider: z.enum(["paystack", "flutterwave"]),
});

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    void logAuditEvent({
      actorType: "anonymous",
      action: "commerce.checkout.create",
      outcome: "blocked",
      severity: "warning",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { reason: "untrusted_origin" },
    }).catch(() => null);
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const rateLimitResult = evaluateRateLimit({
    bucket: "commerce.checkout.create",
    identifier: resolveClientIp(request),
    windowMs: 10 * 60 * 1000,
    max: 20,
    blockDurationMs: 10 * 60 * 1000,
  });
  if (!rateLimitResult.allowed) {
    void logAuditEvent({
      actorType: "anonymous",
      action: "commerce.checkout.create",
      outcome: "blocked",
      severity: "warning",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { reason: "rate_limited" },
    }).catch(() => null);
    return createRateLimitErrorResponse(
      rateLimitResult,
      "Checkout request limit exceeded. Please retry later.",
    );
  }

  const body = await request.json().catch(() => null);
  const validated = checkoutSchema.safeParse(body);
  if (!validated.success) {
    const response = NextResponse.json(
      { error: "Invalid checkout payload", details: validated.error.flatten() },
      { status: 400 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    void logAuditEvent({
      actorType: "anonymous",
      action: "commerce.checkout.create",
      outcome: "failure",
      severity: "warning",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { reason: "invalid_payload" },
    }).catch(() => null);
    return response;
  }

  try {
    const order = await createOrder(validated.data);
    const payment = await createPaymentSession(order.id, validated.data.paymentProvider);
    const response = NextResponse.json({ order, payment }, { status: 201 });
    applyRateLimitHeaders(response, rateLimitResult);
    void logAuditEvent({
      actorType: "customer",
      actorId: validated.data.customerEmail,
      action: "commerce.checkout.create",
      resourceType: "order",
      resourceId: order.id,
      outcome: "success",
      severity: "info",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: {
        paymentProvider: validated.data.paymentProvider,
        lineCount: validated.data.items.length,
      },
    }).catch(() => null);
    return response;
  } catch (error) {
    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout creation failed." },
      { status: 400 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    void logAuditEvent({
      actorType: "customer",
      actorId: validated.data.customerEmail,
      action: "commerce.checkout.create",
      outcome: "failure",
      severity: "warning",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: {
        paymentProvider: validated.data.paymentProvider,
        reason: error instanceof Error ? error.message : "checkout_failed",
      },
    }).catch(() => null);
    return response;
  }
}
