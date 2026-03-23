import { MediaLibraryClient } from "@/components/admin/media-library-client";
import { requireAdminPageRole } from "@/lib/admin/page-auth";

export default async function AdminMediaPage() {
  await requireAdminPageRole("/admin/media");
  return <MediaLibraryClient />;
}
