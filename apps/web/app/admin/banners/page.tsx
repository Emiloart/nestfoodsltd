import { BannerManagerClient } from "@/components/admin/banner-manager-client";
import { requireAdminPageRole } from "@/lib/admin/page-auth";

export default async function AdminBannersPage() {
  await requireAdminPageRole("/admin/banners");
  return <BannerManagerClient />;
}
