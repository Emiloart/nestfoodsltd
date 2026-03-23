import { AdminUsersClient } from "@/components/admin/admin-users-client";
import { requireAdminPageRoles } from "@/lib/admin/page-auth";
import { PageShell } from "@/components/page-shell";

export default async function AdminUsersPage() {
  const role = await requireAdminPageRoles("/admin/users", ["SUPER_ADMIN"]);
  if (!role) {
    return (
      <PageShell
        title="User Directory"
        description="Restricted workspace. SUPER_ADMIN role is required to manage admin users."
      />
    );
  }

  return <AdminUsersClient />;
}
