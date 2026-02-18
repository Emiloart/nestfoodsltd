import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logAuditEvent } from "@/lib/audit/service";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";
import { resolveTraceabilityAdminRole } from "@/lib/traceability/admin";
import { createTraceabilityBatch, listTraceabilityBatches } from "@/lib/traceability/service";

const certificationSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(2).max(120),
  issuer: z.string().trim().min(2).max(120),
  certificateCode: z.string().trim().min(2).max(120),
  validUntil: z.string().trim().max(40).optional(),
});

const timelineEventSchema = z.object({
  id: z.string().trim().optional(),
  stage: z.enum(["sourcing", "processing", "quality_check", "distribution", "delivery"]).optional(),
  title: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().min(2).max(400).optional(),
  location: z.string().trim().min(2).max(120).optional(),
  startedAt: z.string().trim().max(80).optional(),
  completedAt: z.string().trim().max(80).optional(),
});

const batchSchema = z.object({
  batchCode: z.string().trim().min(4).max(120),
  qrCode: z.string().trim().min(6).max(300),
  productSlug: z.string().trim().min(3).max(160),
  productName: z.string().trim().min(2).max(160),
  variantId: z.string().trim().max(120).optional(),
  status: z.enum(["active", "recalled", "sold_out"]),
  productionDate: z.string().trim().min(4).max(40),
  expiryDate: z.string().trim().min(4).max(40),
  source: z.object({
    farmName: z.string().trim().min(2).max(120),
    region: z.string().trim().min(2).max(120),
    country: z.string().trim().min(2).max(120),
    lotReference: z.string().trim().min(2).max(120),
    harvestedAt: z.string().trim().max(80).optional(),
  }),
  processing: z.object({
    facilityName: z.string().trim().min(2).max(160),
    lineName: z.string().trim().min(2).max(120),
    packagedAt: z.string().trim().min(4).max(80),
    qaLead: z.string().trim().min(2).max(120),
  }),
  certifications: z.array(certificationSchema).max(20),
  timeline: z.array(timelineEventSchema).max(40).optional(),
  adminNotes: z.string().trim().max(800).optional(),
});

function logTraceabilityAuditEvent(
  request: NextRequest,
  input: {
    actorRole?: string;
    action: string;
    resourceId?: string;
    outcome: "success" | "failure" | "blocked";
    severity: "info" | "warning" | "critical";
    details?: Record<string, unknown>;
  },
) {
  void logAuditEvent({
    actorType: "admin",
    actorRole: input.actorRole,
    action: input.action,
    resourceType: "traceability.batch",
    resourceId: input.resourceId,
    outcome: input.outcome,
    severity: input.severity,
    ipAddress: resolveClientIp(request),
    userAgent: resolveUserAgent(request),
    details: input.details,
  }).catch(() => null);
}

export async function GET(request: NextRequest) {
  const role = resolveTraceabilityAdminRole(request);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const productSlug = request.nextUrl.searchParams.get("productSlug") ?? undefined;
  const status = request.nextUrl.searchParams.get("status");
  const normalizedStatus =
    status === "active" || status === "recalled" || status === "sold_out" ? status : undefined;
  const batches = await listTraceabilityBatches({
    search,
    productSlug,
    status: normalizedStatus,
  });

  return NextResponse.json({ role, batches });
}

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    logTraceabilityAuditEvent(request, {
      action: "admin.traceability.batch.create",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const role = resolveTraceabilityAdminRole(request);
  if (!role) {
    logTraceabilityAuditEvent(request, {
      action: "admin.traceability.batch.create",
      outcome: "failure",
      severity: "warning",
      details: { reason: "unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = batchSchema.safeParse(body);
  if (!validated.success) {
    logTraceabilityAuditEvent(request, {
      actorRole: role,
      action: "admin.traceability.batch.create",
      outcome: "failure",
      severity: "warning",
      details: { reason: "invalid_payload" },
    });
    return NextResponse.json(
      { error: "Invalid batch payload.", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const batch = await createTraceabilityBatch(validated.data);
    logTraceabilityAuditEvent(request, {
      actorRole: role,
      action: "admin.traceability.batch.create",
      resourceId: batch.id,
      outcome: "success",
      severity: "info",
      details: { batchCode: batch.batchCode },
    });
    return NextResponse.json({ role, batch }, { status: 201 });
  } catch (error) {
    logTraceabilityAuditEvent(request, {
      actorRole: role,
      action: "admin.traceability.batch.create",
      outcome: "failure",
      severity: "warning",
      details: { reason: error instanceof Error ? error.message : "create_failed" },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create batch." },
      { status: 400 },
    );
  }
}
