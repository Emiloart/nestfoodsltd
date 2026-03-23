import { type ReactNode } from "react";

import { requireAdminPageRole } from "@/lib/admin/page-auth";

type AdminContentLayoutProps = {
  children: ReactNode;
};

export default async function AdminContentLayout({ children }: AdminContentLayoutProps) {
  await requireAdminPageRole("/admin/content");
  return children;
}
