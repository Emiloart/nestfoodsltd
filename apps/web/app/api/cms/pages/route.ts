import { NextRequest, NextResponse } from "next/server";

import { hasAdminPermission, resolveAdminRoleFromRequest } from "@/lib/admin/auth";
import { getCmsPages } from "@/lib/cms/service";

export async function GET(request: NextRequest) {
  const preview = request.nextUrl.searchParams.get("preview") === "1";
  if (preview) {
    const role = resolveAdminRoleFromRequest(request);
    if (!role || !hasAdminPermission(role, "cms.pages.read")) {
      return NextResponse.json({ error: "Unauthorized preview request" }, { status: 401 });
    }
  }

  const pages = await getCmsPages({ preview });
  return NextResponse.json({ pages });
}
