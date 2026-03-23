import { CatalogManagerClient } from "@/components/admin/catalog-manager-client";
import { requireAdminPageRole } from "@/lib/admin/page-auth";

export default async function AdminCatalogPage() {
  await requireAdminPageRole("/admin/catalog");
  return <CatalogManagerClient />;
}
