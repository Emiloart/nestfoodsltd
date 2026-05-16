import { CompanyManagerClient } from "@/components/admin/company-manager-client";
import { requireAdminPageRole } from "@/lib/admin/page-auth";

export default async function AdminCompanyPage() {
  await requireAdminPageRole("/admin/company");
  return <CompanyManagerClient />;
}
