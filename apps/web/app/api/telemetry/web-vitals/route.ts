import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  CORE_WEB_VITAL_BUDGETS,
  evaluateCoreWebVital,
  isCoreWebVitalName,
} from "@/lib/performance/core-web-vitals";
import {
  applyRateLimitHeaders,
  createRateLimitErrorResponse,
  evaluateRateLimit,
} from "@/lib/security/rate-limit";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

const webVitalsPayloadSchema = z.object({
  id: z.string().min(1).max(200),
  name: z.enum(["LCP", "INP", "CLS"]),
  value: z.number().finite().nonnegative(),
  rating: z.string().min(1).max(40).optional(),
  navigationType: z.string().min(1).max(40).optional(),
  route: z.string().min(1).max(200).optional(),
});

export async function GET() {
  return NextResponse.json({
    budgets: CORE_WEB_VITAL_BUDGETS,
  });
}

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden origin." }, { status: 403 });
  }

  const ipAddress = resolveClientIp(request);
  const limitResult = evaluateRateLimit({
    bucket: "telemetry:web-vitals",
    identifier: ipAddress,
    windowMs: 60_000,
    max: 180,
    blockDurationMs: 60_000,
  });
  if (!limitResult.allowed) {
    return createRateLimitErrorResponse(limitResult, "Too many web-vitals events.");
  }

  const body = await request.json().catch(() => null);
  const validated = webVitalsPayloadSchema.safeParse(body);
  if (!validated.success) {
    const response = NextResponse.json({ error: "Invalid telemetry payload." }, { status: 400 });
    applyRateLimitHeaders(response, limitResult);
    return response;
  }

  const { name, value, route } = validated.data;
  const status = evaluateCoreWebVital(name, value);
  if (status === "over_budget" && isCoreWebVitalName(name)) {
    console.warn(
      `[web-vitals] ${name} over budget value=${value} route=${route ?? "unknown"} ip=${ipAddress} ua=${resolveUserAgent(request)}`,
    );
  }

  const response = NextResponse.json({
    ok: true,
    status,
    budget: CORE_WEB_VITAL_BUDGETS[name],
  });
  applyRateLimitHeaders(response, limitResult);
  return response;
}
