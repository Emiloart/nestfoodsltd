import { cookies } from "next/headers";

import { OpsOverviewClient } from "@/components/admin/ops-overview-client";
import { PageShell } from "@/components/page-shell";
import { ADMIN_SESSION_COOKIE_NAME, resolveAdminRoleFromToken } from "@/lib/admin/auth";

export default async function AdminOpsPage() {
  const cookieStore = await cookies();
  const role = resolveAdminRoleFromToken(cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value);

  if (role !== "SUPER_ADMIN") {
    return (
      <PageShell
        title="Operations Dashboard"
        description="Restricted workspace. SUPER_ADMIN role is required to view observability and runtime operations data."
      />
    );
  }

  return <OpsOverviewClient />;
}
