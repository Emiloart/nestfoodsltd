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
          adminUsers: process.env.ADMIN_USERS_STORAGE_DRIVER ?? "json",
          cms: process.env.CMS_STORAGE_DRIVER ?? "json",
          catalog: process.env.CATALOG_STORAGE_DRIVER ?? "json",
          chat: process.env.CHAT_STORAGE_DRIVER ?? "json",
          observability: process.env.OBSERVABILITY_STORAGE_DRIVER ?? "json",
        },
      },
    },
    { status: 200 },
  );
}
