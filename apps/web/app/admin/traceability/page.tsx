import { TraceabilityManagerClient } from "@/components/admin/traceability-manager-client";
import { requireAdminPageRole } from "@/lib/admin/page-auth";

export default async function AdminTraceabilityPage() {
  await requireAdminPageRole("/admin/traceability");
  return <TraceabilityManagerClient />;
}
