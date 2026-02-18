import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "nestfoodsltd-web",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? "unknown",
      uptimeSeconds: Math.round(process.uptime()),
      checks: {
        api: "ok",
        storageDrivers: {
          cms: process.env.CMS_STORAGE_DRIVER ?? "json",
          commerce: process.env.COMMERCE_STORAGE_DRIVER ?? "json",
          customer: process.env.CUSTOMER_STORAGE_DRIVER ?? "json",
          b2b: process.env.B2B_STORAGE_DRIVER ?? "json",
          traceability: process.env.TRACEABILITY_STORAGE_DRIVER ?? "json",
          observability: process.env.OBSERVABILITY_STORAGE_DRIVER ?? "json",
        },
      },
    },
    { status: 200 },
  );
}
