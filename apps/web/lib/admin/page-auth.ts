import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_SESSION_COOKIE_NAME,
  type AdminRole,
  resolveAdminRoleFromToken,
} from "@/lib/admin/auth";

function buildAdminLoginRedirect(nextPath: string) {
  const params = new URLSearchParams({ next: nextPath });
  return `/admin/login?${params.toString()}`;
}

export async function resolveAdminPageRole() {
  const cookieStore = await cookies();
  return resolveAdminRoleFromToken(cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value);
}

export async function requireAdminPageRole(nextPath: string) {
  const role = await resolveAdminPageRole();
  if (!role) {
    redirect(buildAdminLoginRedirect(nextPath));
  }
  return role;
}

export async function requireAdminPageRoles(nextPath: string, roles: AdminRole[]) {
  const role = await requireAdminPageRole(nextPath);
  return roles.includes(role) ? role : null;
}
