import { NextRequest, NextResponse } from "next/server";

import { resolveB2BAdminRole } from "@/lib/b2b/admin";
import { listB2BAccounts } from "@/lib/b2b/service";

export async function GET(request: NextRequest) {
  const role = resolveB2BAdminRole(request);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status") ?? undefined;
  const normalizedStatus =
    status === "pending_approval" || status === "approved" || status === "suspended" ? status : undefined;
  const accounts = await listB2BAccounts({ status: normalizedStatus });
  return NextResponse.json({ role, accounts });
}
