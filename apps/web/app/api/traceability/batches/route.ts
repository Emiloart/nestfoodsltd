import { NextRequest, NextResponse } from "next/server";

import { listTraceabilityBatches } from "@/lib/traceability/service";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const productSlug = request.nextUrl.searchParams.get("productSlug") ?? undefined;
  const status = request.nextUrl.searchParams.get("status");
  const normalizedStatus =
    status === "active" || status === "recalled" || status === "sold_out" ? status : undefined;

  const batches = await listTraceabilityBatches({
    search,
    productSlug,
    status: normalizedStatus,
  });

  return NextResponse.json({ batches });
}
