import { NextRequest, NextResponse } from "next/server";

import { hasAdminPermission, resolveAdminRoleFromRequest } from "@/lib/admin/auth";
import { logAuditEvent } from "@/lib/audit/service";
import { deleteAdminRecipe, getAdminRecipeById, updateAdminRecipe } from "@/lib/recipes/service";
import { isTrustedOrigin, resolveClientIp, resolveUserAgent } from "@/lib/security/request";

import { updateRecipeSchema } from "../schema";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

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

function resolveErrorStatus(error: unknown) {
  if (!(error instanceof Error)) {
    return 400;
  }
  if (error.message.toLowerCase().includes("not found")) {
    return 404;
  }
  return 400;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasAdminPermission(role, "cms.recipes.read")) {
    return NextResponse.json({ error: "Forbidden: missing cms.recipes.read" }, { status: 403 });
  }

  const { id } = await Promise.resolve(context.params);
  const recipe = await getAdminRecipeById(id);
  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  }

  return NextResponse.json({ role, recipe });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await Promise.resolve(context.params);

  if (!isTrustedOrigin(request)) {
    logRecipeAuditEvent(request, {
      action: "admin.recipes.update",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    logRecipeAuditEvent(request, {
      action: "admin.recipes.update",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: "unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAdminPermission(role, "cms.recipes.write")) {
    logRecipeAuditEvent(request, {
      actorRole: role,
      action: "admin.recipes.update",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "missing_permission", permission: "cms.recipes.write" },
    });
    return NextResponse.json({ error: "Forbidden: missing cms.recipes.write" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const validated = updateRecipeSchema.safeParse(body);
  if (!validated.success) {
    logRecipeAuditEvent(request, {
      actorRole: role,
      action: "admin.recipes.update",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: "invalid_payload" },
    });
    return NextResponse.json(
      { error: "Invalid update payload.", details: validated.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const recipe = await updateAdminRecipe(id, validated.data);
    logRecipeAuditEvent(request, {
      actorRole: role,
      action: "admin.recipes.update",
      outcome: "success",
      severity: "info",
      resourceId: recipe.id,
      details: { slug: recipe.slug, status: recipe.status },
    });
    return NextResponse.json({ role, recipe });
  } catch (error) {
    logRecipeAuditEvent(request, {
      actorRole: role,
      action: "admin.recipes.update",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: error instanceof Error ? error.message : "update_failed" },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update recipe." },
      { status: resolveErrorStatus(error) },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await Promise.resolve(context.params);

  if (!isTrustedOrigin(request)) {
    logRecipeAuditEvent(request, {
      action: "admin.recipes.delete",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "untrusted_origin" },
    });
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    logRecipeAuditEvent(request, {
      action: "admin.recipes.delete",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: "unauthorized" },
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAdminPermission(role, "cms.recipes.write")) {
    logRecipeAuditEvent(request, {
      actorRole: role,
      action: "admin.recipes.delete",
      outcome: "blocked",
      severity: "warning",
      resourceId: id,
      details: { reason: "missing_permission", permission: "cms.recipes.write" },
    });
    return NextResponse.json({ error: "Forbidden: missing cms.recipes.write" }, { status: 403 });
  }

  try {
    const recipe = await deleteAdminRecipe(id);
    logRecipeAuditEvent(request, {
      actorRole: role,
      action: "admin.recipes.delete",
      outcome: "success",
      severity: "critical",
      resourceId: recipe.id,
      details: { slug: recipe.slug },
    });
    return NextResponse.json({ role, recipe });
  } catch (error) {
    logRecipeAuditEvent(request, {
      actorRole: role,
      action: "admin.recipes.delete",
      outcome: "failure",
      severity: "warning",
      resourceId: id,
      details: { reason: error instanceof Error ? error.message : "delete_failed" },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete recipe." },
      { status: resolveErrorStatus(error) },
    );
  }
}
