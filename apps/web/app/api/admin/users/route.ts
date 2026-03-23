import { NextRequest, NextResponse } from "next/server";

import { resolveAdminSessionFromRequest } from "@/lib/admin/auth";
import { listAdminDirectorySummary } from "@/lib/admin/user-directory";

export async function GET(request: NextRequest) {
  const session = resolveAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden: requires SUPER_ADMIN role" }, { status: 403 });
  }

  const summary = await listAdminDirectorySummary();
  return NextResponse.json({
    role: session.role,
    actorId: session.actorId,
    users: summary.users,
    invites: summary.invites,
  });
}
