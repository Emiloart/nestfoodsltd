import { NextRequest, NextResponse } from "next/server";

import { resolveAdminRoleFromRequest } from "@/lib/admin/auth";
import { getObservabilitySummary } from "@/lib/observability/service";

export async function GET(request: NextRequest) {
  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden: SUPER_ADMIN required." }, { status: 403 });
  }

  const windowHoursRaw = Number.parseInt(request.nextUrl.searchParams.get("windowHours") ?? "", 10);
  const windowHours = Number.isFinite(windowHoursRaw) ? windowHoursRaw : undefined;

  const summary = await getObservabilitySummary({ windowHours });

  return NextResponse.json({
    role,
    summary,
    runtime: {
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      uptimeSeconds: Math.round(process.uptime()),
      generatedAt: new Date().toISOString(),
    },
  });
}
