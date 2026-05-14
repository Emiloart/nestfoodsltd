import { NextResponse } from "next/server";

import { getCareersStorageDriver } from "@/lib/careers/store";
import { getEmailServiceHealth } from "@/lib/email/service";
import { getEnquiriesStorageDriver } from "@/lib/enquiries/store";
import { getNewsletterStorageDriver } from "@/lib/newsletter/store";
import { getPrivacyStorageDriver } from "@/lib/privacy/store";

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
        email: getEmailServiceHealth(),
        storageDrivers: {
          adminUsers: process.env.ADMIN_USERS_STORAGE_DRIVER ?? "json",
          cms: process.env.CMS_STORAGE_DRIVER ?? "json",
          catalog: process.env.CATALOG_STORAGE_DRIVER ?? "json",
          careers: getCareersStorageDriver(),
          chat: process.env.CHAT_STORAGE_DRIVER ?? "json",
          enquiries: getEnquiriesStorageDriver(),
          newsletter: getNewsletterStorageDriver(),
          observability: process.env.OBSERVABILITY_STORAGE_DRIVER ?? "json",
          privacy: getPrivacyStorageDriver(),
        },
      },
    },
    { status: 200 },
  );
}
