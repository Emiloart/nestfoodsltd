import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { sendNewsletterSignupEmails } from "@/lib/email/notifications";
import { subscribeToNewsletter } from "@/lib/newsletter/service";
import {
  applyRateLimitHeaders,
  createRateLimitErrorResponse,
  evaluateRateLimit,
} from "@/lib/security/rate-limit";
import { isTrustedOrigin, resolveClientIp } from "@/lib/security/request";

const newsletterSchema = z.object({
  email: z.string().trim().email().max(180),
  fullName: z.string().trim().max(140).optional(),
  source: z.string().trim().max(80).optional(),
  consentMarketing: z.boolean(),
});

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const rateLimitResult = evaluateRateLimit({
    bucket: "newsletter.subscribe",
    identifier: resolveClientIp(request),
    windowMs: 10 * 60 * 1000,
    max: 8,
    blockDurationMs: 10 * 60 * 1000,
  });
  if (!rateLimitResult.allowed) {
    return createRateLimitErrorResponse(
      rateLimitResult,
      "Newsletter signup limit exceeded. Please retry shortly.",
    );
  }

  const body = await request.json().catch(() => null);
  const validated = newsletterSchema.safeParse(body);
  if (!validated.success) {
    const response = NextResponse.json(
      { error: "Invalid newsletter payload.", details: validated.error.flatten() },
      { status: 400 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  }

  try {
    const result = await subscribeToNewsletter(validated.data);
    const emailDelivery = await sendNewsletterSignupEmails(result);
    const response = NextResponse.json(
      {
        subscriber: {
          id: result.subscriber.id,
          email: result.subscriber.email,
          created: result.created,
        },
        emailDelivery,
      },
      { status: result.created ? 201 : 200 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  } catch {
    const response = NextResponse.json(
      { error: "Newsletter signup could not be saved. Please try again." },
      { status: 500 },
    );
    applyRateLimitHeaders(response, rateLimitResult);
    return response;
  }
}
