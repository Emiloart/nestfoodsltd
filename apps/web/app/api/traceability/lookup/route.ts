import { NextRequest, NextResponse } from "next/server";

import { lookupTraceabilityBatch } from "@/lib/traceability/service";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code") ?? "";
  if (!code.trim()) {
    return NextResponse.json({ error: "Missing lookup code." }, { status: 400 });
  }

  const batch = await lookupTraceabilityBatch(code);
  if (!batch) {
    return NextResponse.json({ error: "Batch not found.", batch: null }, { status: 404 });
  }

  return NextResponse.json({ batch });
}
