import { AuditEventsClient } from "@/components/admin/audit-events-client";
import { PageShell } from "@/components/page-shell";
import { requireAdminPageRole } from "@/lib/admin/page-auth";

export default async function AdminAuditPage() {
  const role = await requireAdminPageRole("/admin/audit");

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
