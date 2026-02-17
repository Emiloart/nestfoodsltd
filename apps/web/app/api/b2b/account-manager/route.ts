import { NextRequest, NextResponse } from "next/server";

import { getB2BSessionAccountId } from "@/lib/b2b/session";
import { getB2BAccountManager } from "@/lib/b2b/service";

export async function GET(request: NextRequest) {
  const accountId = getB2BSessionAccountId(request);
  if (!accountId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const accountManager = await getB2BAccountManager(accountId);
  return NextResponse.json({ accountManager });
}
