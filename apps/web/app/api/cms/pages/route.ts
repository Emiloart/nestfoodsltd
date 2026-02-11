import { NextResponse } from "next/server";

import { getCmsPages } from "@/lib/cms/service";

export async function GET() {
  const pages = await getCmsPages();
  return NextResponse.json({ pages });
}
