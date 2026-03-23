import { NextRequest, NextResponse } from "next/server";

import { hasAdminPermission, resolveAdminRoleFromRequest } from "@/lib/admin/auth";
import { logAuditEvent } from "@/lib/audit/service";
import { createAdminRecipe, listAdminRecipes } from "@/lib/recipes/service";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

import { createRecipeSchema } from "./schema";

function logRecipeAuditEvent(
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
    resourceType: "recipe",
    resourceId: input.resourceId,
    outcome: input.outcome,
    severity: input.severity,
    ipAddress: resolveClientIp(request),
    userAgent: resolveUserAgent(request),
    details: input.details,
  }).catch(() => null);
}

export async function GET(request: NextRequest) {
  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasAdminPermission(role, "cms.recipes.read")) {
    return NextResponse.json({ error: "Forbidden: missing cms.recipes.read" }, { status: 403 });
  }

  const recipes = await listAdminRecipes();
  return NextResponse.json({ role, recipes });
}

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    logRecipeAuditEvent(request, {
      action: "admin.recipes.create",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    logRecipeAuditEvent(request, {
      action: "admin.recipes.create",
      outcome: "failure",
      severity: "warning",
      details: { reason: "unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAdminPermission(role, "cms.recipes.write")) {
    logRecipeAuditEvent(request, {
      actorRole: role,
      action: "admin.recipes.create",
      outcome: "blocked",
      severity: "warning",
      details: { reason: "missing_permission", permission: "cms.recipes.write" },
    });
    return NextResponse.json({ error: "Forbidden: missing cms.recipes.write" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const validated = createRecipeSchema.safeParse(body);
  if (!validated.success) {
    logRecipeAuditEvent(request, {
      actorRole: role,
      action: "admin.recipes.create",
      outcome: "failure",
      severity: "warning",
      details: { reason: "invalid_payload" },
    });
    return NextResponse.json(
      { error: "Invalid recipe payload.", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const recipe = await createAdminRecipe(validated.data);
    logRecipeAuditEvent(request, {
      actorRole: role,
      action: "admin.recipes.create",
      outcome: "success",
      severity: "info",
      resourceId: recipe.id,
      details: { slug: recipe.slug, status: recipe.status },
    });
    return NextResponse.json({ role, recipe }, { status: 201 });
  } catch (error) {
    logRecipeAuditEvent(request, {
      actorRole: role,
      action: "admin.recipes.create",
      outcome: "failure",
      severity: "warning",
      details: { reason: error instanceof Error ? error.message : "create_failed" },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create recipe." },
      { status: 400 },
    );
  }
}
