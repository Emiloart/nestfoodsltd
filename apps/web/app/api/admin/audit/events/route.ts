import { NextRequest, NextResponse } from "next/server";

import { resolveAdminRoleFromRequest } from "@/lib/admin/auth";
import { listAuditEvents } from "@/lib/audit/service";

export async function GET(request: NextRequest) {
  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden: SUPER_ADMIN required." }, { status: 403 });
  }

  const action = request.nextUrl.searchParams.get("action") ?? undefined;
  const outcomeParam = request.nextUrl.searchParams.get("outcome");
  const actorTypeParam = request.nextUrl.searchParams.get("actorType");
  const severityParam = request.nextUrl.searchParams.get("severity");
  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const limitRaw = Number.parseInt(request.nextUrl.searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(limitRaw) ? limitRaw : undefined;

  const outcome =
    outcomeParam === "success" || outcomeParam === "failure" || outcomeParam === "blocked"
      ? outcomeParam
      : undefined;
  const actorType =
    actorTypeParam === "admin" ||
    actorTypeParam === "customer" ||
    actorTypeParam === "b2b" ||
    actorTypeParam === "system" ||
    actorTypeParam === "anonymous"
      ? actorTypeParam
      : undefined;
  const severity =
    severityParam === "info" || severityParam === "warning" || severityParam === "critical"
      ? severityParam
      : undefined;

  const events = await listAuditEvents({
    action,
    outcome,
    actorType,
    severity,
    search,
    limit,
  });

  return NextResponse.json({ role, events });
}
