import { cookies } from "next/headers";

import { AuditEventsClient } from "@/components/admin/audit-events-client";
import { PageShell } from "@/components/page-shell";
import { ADMIN_SESSION_COOKIE_NAME, resolveAdminRoleFromToken } from "@/lib/admin/auth";

export default async function AdminAuditPage() {
  const cookieStore = await cookies();
  const role = resolveAdminRoleFromToken(cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value);

  if (role !== "SUPER_ADMIN") {
    return (
      <PageShell
        title="Audit Events"
        description="Restricted workspace. SUPER_ADMIN role is required to view security audit events."
      />
    );
  }

  return <AuditEventsClient />;
}
