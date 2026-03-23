import { OpsOverviewClient } from "@/components/admin/ops-overview-client";
import { PageShell } from "@/components/page-shell";
import { requireAdminPageRole } from "@/lib/admin/page-auth";

export default async function AdminOpsPage() {
  const role = await requireAdminPageRole("/admin/ops");

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
