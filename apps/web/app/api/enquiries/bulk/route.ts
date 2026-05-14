import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { sendEnquiryLeadEmails } from "@/lib/email/notifications";
import { captureEnquiryLead } from "@/lib/enquiries/service";
import {
  applyRateLimitHeaders,
  createRateLimitErrorResponse,
  evaluateRateLimit,
} from "@/lib/security/rate-limit";
import { isTrustedOrigin, resolveClientIp } from "@/lib/security/request";

const bulkEnquirySchema = z.object({
  fullName: z.string().trim().min(2).max(140),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(180).optional().or(z.literal("")),
  location: z.string().trim().max(160).optional(),
  productInterest: z.string().trim().max(180).optional(),
  quantity: z.string().trim().max(120).optional(),
  message: z.string().trim().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const rateLimitResult = evaluateRateLimit({
    bucket: "enquiries.bulk",
    identifier: resolveClientIp(request),
    windowMs: 10 * 60 * 1000,
    max: 8,
    blockDurationMs: 10 * 60 * 1000,
  });
  if (!rateLimitResult.allowed) {
    return createRateLimitErrorResponse(
      rateLimitResult,
      "Supply enquiry limit exceeded. Please retry shortly.",
    );
  }

  const body = await request.json().catch(() => null);
  const validated = bulkEnquirySchema.safeParse(body);
  if (!validated.success) {
    const response = NextResponse.json(
      { error: "Invalid supply enquiry payload.", details: validated.error.flatten() },
      { status: 400 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  }

  try {
    const lead = await captureEnquiryLead({
      type: "bulk",
      ...validated.data,
      email: validated.data.email || undefined,
    });
    const emailDelivery = await sendEnquiryLeadEmails(lead);
    const response = NextResponse.json(
      { lead: { id: lead.id, type: lead.type }, emailDelivery },
      { status: 201 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  } catch {
    const response = NextResponse.json(
      { error: "Supply enquiry could not be saved. Please try again." },
      { status: 500 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  }
}
