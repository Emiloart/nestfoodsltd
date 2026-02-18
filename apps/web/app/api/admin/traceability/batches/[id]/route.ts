import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { resolveTraceabilityAdminRole } from "@/lib/traceability/admin";
import { getTraceabilityBatchById, updateTraceabilityBatch } from "@/lib/traceability/service";

const updateSchema = z.object({
  batchCode: z.string().trim().min(4).max(120).optional(),
  qrCode: z.string().trim().min(6).max(300).optional(),
  productSlug: z.string().trim().min(3).max(160).optional(),
  productName: z.string().trim().min(2).max(160).optional(),
  variantId: z.string().trim().max(120).optional(),
  status: z.enum(["active", "recalled", "sold_out"]).optional(),
  productionDate: z.string().trim().min(4).max(40).optional(),
  expiryDate: z.string().trim().min(4).max(40).optional(),
  source: z
    .object({
      farmName: z.string().trim().min(2).max(120).optional(),
      region: z.string().trim().min(2).max(120).optional(),
      country: z.string().trim().min(2).max(120).optional(),
      lotReference: z.string().trim().min(2).max(120).optional(),
      harvestedAt: z.string().trim().max(80).optional(),
    })
    .optional(),
  processing: z
    .object({
      facilityName: z.string().trim().min(2).max(160).optional(),
      lineName: z.string().trim().min(2).max(120).optional(),
      packagedAt: z.string().trim().min(4).max(80).optional(),
      qaLead: z.string().trim().min(2).max(120).optional(),
    })
    .optional(),
  certifications: z
    .array(
      z.object({
        id: z.string().trim().optional(),
        name: z.string().trim().min(2).max(120).optional(),
        issuer: z.string().trim().min(2).max(120).optional(),
        certificateCode: z.string().trim().min(2).max(120).optional(),
        validUntil: z.string().trim().max(40).optional(),
      }),
    )
    .max(20)
    .optional(),
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

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(request: NextRequest, context: RouteContext) {
  const role = resolveTraceabilityAdminRole(request);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await Promise.resolve(context.params);
  const batch = await getTraceabilityBatchById(id);
  if (!batch) {
    return NextResponse.json({ error: "Batch not found." }, { status: 404 });
  }

  return NextResponse.json({ role, batch });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const role = resolveTraceabilityAdminRole(request);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = updateSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Invalid update payload.", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  const { id } = await Promise.resolve(context.params);
  try {
    const batch = await updateTraceabilityBatch(id, validated.data);
    return NextResponse.json({ role, batch });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update batch." },
      { status: 400 },
    );
  }
}
