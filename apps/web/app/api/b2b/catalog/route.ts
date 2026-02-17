import { NextRequest, NextResponse } from "next/server";

import { getB2BSessionAccountId } from "@/lib/b2b/session";
import { getB2BAccountById, listB2BCatalogForAccount } from "@/lib/b2b/service";

export async function GET(request: NextRequest) {
  const accountId = getB2BSessionAccountId(request);
  if (!accountId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const account = await getB2BAccountById(accountId);
  if (!account) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }
  if (account.status !== "approved") {
    return NextResponse.json(
      {
        error: "Account is pending approval.",
        accountStatus: account.status,
      },
      { status: 403 },
    );
  }

  try {
    const catalog = await listB2BCatalogForAccount(accountId);
    return NextResponse.json({ account, ...catalog });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load catalog." }, { status: 400 });
  }
}
