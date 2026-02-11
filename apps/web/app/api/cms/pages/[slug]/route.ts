import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCmsPage, updateCmsPage } from "@/lib/cms/service";
import { CMS_PAGE_SLUGS, type CmsPageSlug } from "@/lib/cms/types";

const updatePageSchema = z.object({
  title: z.string().trim().min(2).max(120),
  headline: z.string().trim().min(2).max(220),
  description: z.string().trim().min(2).max(1200),
  ctaPrimaryLabel: z.string().trim().max(50).optional(),
  ctaPrimaryHref: z.string().trim().max(200).optional(),
  ctaSecondaryLabel: z.string().trim().max(50).optional(),
  ctaSecondaryHref: z.string().trim().max(200).optional(),
});

function parseSlug(value: string): CmsPageSlug | null {
  if (CMS_PAGE_SLUGS.includes(value as CmsPageSlug)) {
    return value as CmsPageSlug;
  }
  return null;
}

function normalizeOptional(value?: string) {
  if (!value) {
    return undefined;
  }
  return value;
}

function authorizeAdminRequest(request: NextRequest) {
  const configuredToken = process.env.ADMIN_API_TOKEN;
  if (!configuredToken) {
    return NextResponse.json(
      { error: "ADMIN_API_TOKEN is not configured. Add it to .env.local for admin updates." },
      { status: 503 },
    );
  }

  const receivedToken = request.headers.get("x-admin-token");
  if (receivedToken !== configuredToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

type RouteContext = {
  params: Promise<{ slug: string }> | { slug: string };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { slug: rawSlug } = await Promise.resolve(context.params);
  const slug = parseSlug(rawSlug);
  if (!slug) {
    return NextResponse.json({ error: "Invalid page slug" }, { status: 400 });
  }

  const page = await getCmsPage(slug);
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }
  return NextResponse.json({ page });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const authErrorResponse = authorizeAdminRequest(request);
  if (authErrorResponse) {
    return authErrorResponse;
  }

  const { slug: rawSlug } = await Promise.resolve(context.params);
  const slug = parseSlug(rawSlug);
  if (!slug) {
    return NextResponse.json({ error: "Invalid page slug" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const validated = updatePageSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid payload", details: validated.error.flatten() }, { status: 400 });
  }

  const updated = await updateCmsPage(slug, {
    ...validated.data,
    ctaPrimaryLabel: normalizeOptional(validated.data.ctaPrimaryLabel),
    ctaPrimaryHref: normalizeOptional(validated.data.ctaPrimaryHref),
    ctaSecondaryLabel: normalizeOptional(validated.data.ctaSecondaryLabel),
    ctaSecondaryHref: normalizeOptional(validated.data.ctaSecondaryHref),
  });

  return NextResponse.json({ page: updated });
}
