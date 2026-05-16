import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { hasAdminPermission } from "@/lib/admin/auth";
import { requireAdminPageRole } from "@/lib/admin/page-auth";

export default async function AdminPage() {
  const role = await requireAdminPageRole("/admin");
  const canManageBanners = role ? hasAdminPermission(role, "cms.pages.read") : false;
  const canManageCompany = role ? hasAdminPermission(role, "cms.pages.read") : false;
  const canManageMedia = role ? hasAdminPermission(role, "cms.media.read") : false;
  const canManageCatalog = role ? hasAdminPermission(role, "cms.catalog.read") : false;
  const canManageUsers = role === "SUPER_ADMIN";
  const canViewAudit = role === "SUPER_ADMIN";
  const canViewOps = role === "SUPER_ADMIN";

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-3">
        <Badge>Website Admin</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          De-Nest Bread Website Admin
        </h1>
        <p className="text-sm text-neutral-600">
          Manage homepage banners, page content, media, product catalogue, and admin access for Nest
          Foods Limited. Active role: <span className="font-semibold">{role ?? "UNKNOWN"}</span>.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/content" className="block transition hover:-translate-y-1">
          <Card className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-900">Content Manager</h2>
            <p className="text-sm text-neutral-600">
              Edit public website copy for Home, About, Careers, and Contact.
            </p>
          </Card>
        </Link>
        {canManageCompany ? (
          <Link href="/admin/company" className="block transition hover:-translate-y-1">
            <Card className="space-y-2">
              <h2 className="text-base font-semibold text-neutral-900">Company Controls</h2>
              <p className="text-sm text-neutral-600">
                Edit contacts, socials, About details, careers, branch offices, FAQ, and trust text.
              </p>
            </Card>
          </Link>
        ) : (
          <Card className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-900">Company Controls</h2>
            <p className="text-sm text-neutral-600">Requires `cms.pages.read` permission.</p>
          </Card>
        )}
        {canManageBanners ? (
          <Link href="/admin/banners" className="block transition hover:-translate-y-1">
            <Card className="space-y-2">
              <h2 className="text-base font-semibold text-neutral-900">Banner Manager</h2>
              <p className="text-sm text-neutral-600">
                Upload homepage banner images and manage action button links.
              </p>
            </Card>
          </Link>
        ) : (
          <Card className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-900">Banner Manager</h2>
            <p className="text-sm text-neutral-600">Requires `cms.pages.read` permission.</p>
          </Card>
        )}
        {canManageMedia ? (
          <Link href="/admin/media" className="block transition hover:-translate-y-1">
            <Card className="space-y-2">
              <h2 className="text-base font-semibold text-neutral-900">Media Library</h2>
              <p className="text-sm text-neutral-600">
                Manage website asset metadata, folders, alt text, and usage references.
              </p>
            </Card>
          </Link>
        ) : (
          <Card className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-900">Media Library</h2>
            <p className="text-sm text-neutral-600">Requires `cms.media.read` permission.</p>
          </Card>
        )}
        {canManageCatalog ? (
          <Link href="/admin/catalog" className="block transition hover:-translate-y-1">
            <Card className="space-y-2">
              <h2 className="text-base font-semibold text-neutral-900">Catalogue Manager</h2>
              <p className="text-sm text-neutral-600">
                Manage product names, descriptions, images, ingredients, allergens, nutrition notes,
                pack formats, and publishing states.
              </p>
            </Card>
          </Link>
        ) : (
          <Card className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-900">Catalogue Manager</h2>
            <p className="text-sm text-neutral-600">Requires `cms.catalog.read` permission.</p>
          </Card>
        )}
        {canManageUsers ? (
          <Link href="/admin/users" className="block transition hover:-translate-y-1">
            <Card className="space-y-2">
              <h2 className="text-base font-semibold text-neutral-900">User Directory</h2>
              <p className="text-sm text-neutral-600">
                Invite, suspend, and update approved website administrators.
              </p>
            </Card>
          </Link>
        ) : (
          <Card className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-900">User Directory</h2>
            <p className="text-sm text-neutral-600">Requires `SUPER_ADMIN` role.</p>
          </Card>
        )}
        {canViewAudit ? (
          <Link href="/admin/audit" className="block transition hover:-translate-y-1">
            <Card className="space-y-2">
              <h2 className="text-base font-semibold text-neutral-900">Audit Events</h2>
              <p className="text-sm text-neutral-600">
                Review admin activity, failed access, and blocked requests.
              </p>
            </Card>
          </Link>
        ) : (
          <Card className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-900">Audit Events</h2>
            <p className="text-sm text-neutral-600">Requires `SUPER_ADMIN` role.</p>
          </Card>
        )}
        {canViewOps ? (
          <Link href="/admin/ops" className="block transition hover:-translate-y-1">
            <Card className="space-y-2">
              <h2 className="text-base font-semibold text-neutral-900">Operations</h2>
              <p className="text-sm text-neutral-600">
                Review website health, page performance signals, and captured app errors.
              </p>
            </Card>
          </Link>
        ) : (
          <Card className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-900">Operations</h2>
            <p className="text-sm text-neutral-600">Requires `SUPER_ADMIN` role.</p>
          </Card>
        )}
      </div>
    </section>
  );
}
