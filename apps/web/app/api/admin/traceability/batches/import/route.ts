import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { logAuditEvent } from "@/lib/audit/service";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";
import { resolveTraceabilityAdminRole } from "@/lib/traceability/admin";
import { importTraceabilityBatches } from "@/lib/traceability/service";

const itemSchema = z.object({
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
  certifications: z
    .array(
      z.object({
        id: z.string().trim().optional(),
        name: z.string().trim().min(2).max(120),
        issuer: z.string().trim().min(2).max(120),
        certificateCode: z.string().trim().min(2).max(120),
        validUntil: z.string().trim().max(40).optional(),
      }),
    )
    .max(20),
  timeline: z
    .array(
      z.object({
        id: z.string().trim().optional(),
        stage: z
          .enum(["sourcing", "processing", "quality_check", "distribution", "delivery"])
          .optional(),
        title: z.string().trim().min(2).max(120).optional(),
        description: z.string().trim().min(2).max(400).optional(),
        location: z.string().trim().min(2).max(120).optional(),
        startedAt: z.string().trim().max(80).optional(),
        completedAt: z.string().trim().max(80).optional(),
      }),
    )
    .max(40)
    .optional(),
  adminNotes: z.string().trim().max(800).optional(),
});

const importSchema = z.object({
  items: z.array(itemSchema).min(1).max(200),
});

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    void logAuditEvent({
      actorType: "admin",
      action: "admin.traceability.batch.import",
      outcome: "blocked",
      severity: "warning",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { reason: "untrusted_origin" },
    }).catch(() => null);
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const role = resolveTraceabilityAdminRole(request);
  if (!role) {
    void logAuditEvent({
      actorType: "admin",
      action: "admin.traceability.batch.import",
      outcome: "failure",
      severity: "warning",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { reason: "unauthorized" },
    }).catch(() => null);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = importSchema.safeParse(body);
  if (!validated.success) {
    void logAuditEvent({
      actorType: "admin",
      actorRole: role,
      action: "admin.traceability.batch.import",
      outcome: "failure",
      severity: "warning",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { reason: "invalid_payload" },
    }).catch(() => null);
    return NextResponse.json(
      { error: "Invalid import payload.", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const batches = await importTraceabilityBatches(validated.data.items);
    void logAuditEvent({
      actorType: "admin",
      actorRole: role,
      action: "admin.traceability.batch.import",
      outcome: "success",
      severity: "info",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { imported: batches.length },
    }).catch(() => null);
    return NextResponse.json(
      {
        role,
        imported: batches.length,
        batches,
      },
      { status: 201 },
    );
  } catch (error) {
    void logAuditEvent({
      actorType: "admin",
      actorRole: role,
      action: "admin.traceability.batch.import",
      outcome: "failure",
      severity: "warning",
      ipAddress: resolveClientIp(request),
      userAgent: resolveUserAgent(request),
      details: { reason: error instanceof Error ? error.message : "import_failed" },
    }).catch(() => null);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import batches." },
      { status: 400 },
    );
  }
}
