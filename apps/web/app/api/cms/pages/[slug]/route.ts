import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { hasAdminPermission, resolveAdminRoleFromRequest } from "@/lib/admin/auth";
import { logAuditEvent } from "@/lib/audit/service";
import { getCmsPage, updateCmsPage } from "@/lib/cms/service";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";
import { CMS_PAGE_SLUGS, type CmsPageSlug, type CmsPublicationStatus } from "@/lib/cms/types";

const updatePageSchema = z.object({
  title: z.string().trim().min(2).max(120),
  headline: z.string().trim().min(2).max(220),
  description: z.string().trim().min(2).max(1200),
  status: z.enum(["draft", "published", "scheduled"]),
  publishAt: z.string().trim().optional(),
  ctaPrimaryLabel: z.string().trim().max(50).optional(),
  ctaPrimaryHref: z.string().trim().max(200).optional(),
  ctaSecondaryLabel: z.string().trim().max(50).optional(),
  ctaSecondaryHref: z.string().trim().max(200).optional(),
  heroImageUrl: z.string().trim().max(200).optional(),
  logoImageUrl: z.string().trim().max(200).optional(),
  seoTitle: z.string().trim().max(160).optional(),
  seoDescription: z.string().trim().max(220).optional(),
  seoOgImageUrl: z.string().trim().max(200).optional(),
});

function parseSlug(value: string): CmsPageSlug | null {
  if (CMS_PAGE_SLUGS.includes(value as CmsPageSlug)) {
    return value as CmsPageSlug;
  }
  return null;
}

function normalizeOptional(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed;
}

function normalizePublishAt(status: CmsPublicationStatus, value?: string) {
  if (status !== "scheduled") {
    return undefined;
  }
  const parsedDate = value ? new Date(value) : null;
  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    return new Date(Date.now() + 15 * 60 * 1000).toISOString();
  }
  return parsedDate.toISOString();
}

function logCmsAuditEvent(
  request: NextRequest,
  input: {
    actorRole?: string;
    action: string;
    outcome: "success" | "failure" | "blocked";
    severity: "info" | "warning" | "critical";
    resourceId?: string;
    details?: Record<string, unknown>;
  },
) {
  void logAuditEvent({
    actorType: "admin",
    actorRole: input.actorRole,
    action: input.action,
    resourceType: "cms.page",
    resourceId: input.resourceId,
    outcome: input.outcome,
    severity: input.severity,
    ipAddress: resolveClientIp(request),
    userAgent: resolveUserAgent(request),
    details: input.details,
  }).catch(() => null);
}

type RouteContext = {
  params: Promise<{ slug: string }> | { slug: string };
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug: rawSlug } = await Promise.resolve(context.params);
  const slug = parseSlug(rawSlug);
  if (!slug) {
    return NextResponse.json({ error: "Invalid page slug" }, { status: 400 });
  }

  const preview = request.nextUrl.searchParams.get("preview") === "1";
  if (preview) {
    const role = resolveAdminRoleFromRequest(request);
    if (!role || !hasAdminPermission(role, "cms.pages.read")) {
      return NextResponse.json({ error: "Unauthorized preview request" }, { status: 401 });
    }
  }

  const page = await getCmsPage(slug, { preview });
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }
  return NextResponse.json({ page });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  if (!isTrustedOrigin(request)) {
    logCmsAuditEvent(request, {
      action: "admin.cms.page.update",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    logCmsAuditEvent(request, {
      action: "admin.cms.page.update",
      outcome: "failure",
      severity: "warning",
      details: { reason: "unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAdminPermission(role, "cms.pages.write")) {
    logCmsAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.page.update",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "missing_permission", permission: "cms.pages.write" },
    });
    return NextResponse.json({ error: "Forbidden: missing cms.pages.write" }, { status: 403 });
  }

  const { slug: rawSlug } = await Promise.resolve(context.params);
  const slug = parseSlug(rawSlug);
  if (!slug) {
    logCmsAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.page.update",
      outcome: "failure",
      severity: "warning",
      details: { reason: "invalid_slug", slug: rawSlug },
    });
    return NextResponse.json({ error: "Invalid page slug" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const validated = updatePageSchema.safeParse(body);
  if (!validated.success) {
    logCmsAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.page.update",
      outcome: "failure",
      severity: "warning",
      resourceId: slug,
      details: { reason: "invalid_payload" },
    });
    return NextResponse.json(
      { error: "Invalid payload", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  if (
    (validated.data.status === "published" || validated.data.status === "scheduled") &&
    !hasAdminPermission(role, "cms.pages.publish")
  ) {
    logCmsAuditEvent(request, {
      actorRole: role,
      action: "admin.cms.page.update",
      outcome: "blocked",
      severity: "warning",
      resourceId: slug,
      details: { reason: "missing_permission", permission: "cms.pages.publish" },
    });
    return NextResponse.json({ error: "Forbidden: missing cms.pages.publish" }, { status: 403 });
  }

  const updated = await updateCmsPage(
    slug,
    {
      title: validated.data.title,
      headline: validated.data.headline,
      description: validated.data.description,
      status: validated.data.status,
      publishAt: normalizePublishAt(validated.data.status, validated.data.publishAt),
      ctaPrimaryLabel: normalizeOptional(validated.data.ctaPrimaryLabel),
      ctaPrimaryHref: normalizeOptional(validated.data.ctaPrimaryHref),
      ctaSecondaryLabel: normalizeOptional(validated.data.ctaSecondaryLabel),
      ctaSecondaryHref: normalizeOptional(validated.data.ctaSecondaryHref),
      heroImageUrl: normalizeOptional(validated.data.heroImageUrl),
      logoImageUrl: normalizeOptional(validated.data.logoImageUrl),
      seo: {
        title: normalizeOptional(validated.data.seoTitle),
        description: normalizeOptional(validated.data.seoDescription),
        ogImageUrl: normalizeOptional(validated.data.seoOgImageUrl),
      },
    },
    role,
  );

  logCmsAuditEvent(request, {
    actorRole: role,
    action: "admin.cms.page.update",
    outcome: "success",
    severity: "info",
    resourceId: slug,
    details: { status: updated.status },
  });

  return NextResponse.json({ page: updated, role });
}
