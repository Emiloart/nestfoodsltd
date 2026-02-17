import { type NextRequest } from "next/server";

import { resolveAdminRoleFromRequest } from "@/lib/admin/auth";

export function resolveB2BAdminRole(request: NextRequest) {
  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    return null;
  }
  if (role === "SUPER_ADMIN" || role === "SALES_MANAGER") {
    return role;
  }
  return null;
}
