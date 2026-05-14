import { OpsOverviewClient } from "@/components/admin/ops-overview-client";
import { PageShell } from "@/components/page-shell";
import { requireAdminPageRole } from "@/lib/admin/page-auth";

export default async function AdminOpsPage() {
  const role = await requireAdminPageRole("/admin/ops");

  if (role !== "SUPER_ADMIN") {
    return (
      <PageShell
        title="Website Health"
        description="Restricted workspace. SUPER_ADMIN role is required to view website health and performance data."
      />
    );
  }

  return <OpsOverviewClient />;
}
