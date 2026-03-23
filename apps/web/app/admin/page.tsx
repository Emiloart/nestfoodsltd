import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { hasAdminPermission } from "@/lib/admin/auth";
import { requireAdminPageRole } from "@/lib/admin/page-auth";

export default async function AdminPage() {
  const role = await requireAdminPageRole("/admin");
  const canManageBanners = role ? hasAdminPermission(role, "cms.pages.read") : false;
  const canManageMedia = role ? hasAdminPermission(role, "cms.media.read") : false;
  const canManageRecipes = role ? hasAdminPermission(role, "cms.recipes.read") : false;
  const canManageCatalog = role ? hasAdminPermission(role, "cms.catalog.read") : false;
  const canManageOrders = role ? hasAdminPermission(role, "orders.read") : false;
  const canManageTraceability = role === "SUPER_ADMIN" || role === "SALES_MANAGER";
  const canManageUsers = role === "SUPER_ADMIN";
  const canViewAudit = role === "SUPER_ADMIN";
  const canViewOps = role === "SUPER_ADMIN";

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-3">
        <Badge>Admin Workspace</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Operations Dashboard
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Secure control plane for dynamic content, catalog management, media, and operations.
          Active role: <span className="font-semibold">{role ?? "UNKNOWN"}</span>.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Link href="/admin/content" className="block transition hover:-translate-y-1">
          <Card className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Content Manager
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Edit Home, About, Vision, Contact, Careers, and Sustainability content.
            </p>
          </Card>
        </Link>
        {canManageBanners ? (
          <Link href="/admin/banners" className="block transition hover:-translate-y-1">
            <Card className="space-y-2">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Banner Manager
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Create, schedule, and order homepage hero banners and CTA surfaces.
              </p>
            </Card>
          </Link>
        ) : (
          <Card className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Banner Manager
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Requires `cms.pages.read` permission.
            </p>
          </Card>
        )}
        {canManageMedia ? (
          <Link href="/admin/media" className="block transition hover:-translate-y-1">
            <Card className="space-y-2">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Media Library
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Manage asset metadata, folders, alt text, and usage references.
              </p>
            </Card>
          </Link>
        ) : (
          <Card className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Media Library
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Requires `cms.media.read` permission.
            </p>
          </Card>
        )}
        {canManageTraceability ? (
          <Link href="/admin/traceability" className="block transition hover:-translate-y-1">
            <Card className="space-y-2">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Traceability Manager
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Create, import, and maintain batch journey records and certifications.
              </p>
            </Card>
          </Link>
        ) : (
          <Card className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Traceability Manager
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Requires `SUPER_ADMIN` or `SALES_MANAGER` role.
            </p>
          </Card>
        )}
        {canManageCatalog ? (
          <Link href="/admin/catalog" className="block transition hover:-translate-y-1">
            <Card className="space-y-2">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Catalog Manager
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Manage products, variants, nutrition data, allergens, bulk quantity limits, region
                availability, and publishing states.
              </p>
            </Card>
          </Link>
        ) : (
          <Card className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Catalog Manager
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Requires `cms.catalog.read` permission.
            </p>
          </Card>
        )}
        {canManageRecipes ? (
          <Link href="/admin/recipes" className="block transition hover:-translate-y-1">
            <Card className="space-y-2">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Recipe Manager
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Create, edit, and publish recipe content with product-linked suggestions.
              </p>
            </Card>
          </Link>
        ) : (
          <Card className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Recipe Manager
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Requires `cms.recipes.read` permission.
            </p>
          </Card>
        )}
        {canManageOrders ? (
          <Link href="/admin/orders" className="block transition hover:-translate-y-1">
            <Card className="space-y-2">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Order Control
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Manage order lifecycle states, timeline notes, and payment webhook event visibility.
              </p>
            </Card>
          </Link>
        ) : (
          <Card className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Order Control
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Requires `orders.read` permission.
            </p>
          </Card>
        )}
        {canManageUsers ? (
          <Link href="/admin/users" className="block transition hover:-translate-y-1">
            <Card className="space-y-2">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                User Directory
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Invite, suspend, and update admin users with role and MFA policy controls.
              </p>
            </Card>
          </Link>
        ) : (
          <Card className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              User Directory
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Requires `SUPER_ADMIN` role.
            </p>
          </Card>
        )}
        {canViewAudit ? (
          <Link href="/admin/audit" className="block transition hover:-translate-y-1">
            <Card className="space-y-2">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Audit Events
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Review security-sensitive actions, failures, and blocked requests.
              </p>
            </Card>
          </Link>
        ) : (
          <Card className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Audit Events
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Requires `SUPER_ADMIN` role.
            </p>
          </Card>
        )}
        {canViewOps ? (
          <Link href="/admin/ops" className="block transition hover:-translate-y-1">
            <Card className="space-y-2">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Operations
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Monitor runtime health, Core Web Vitals budget, and captured app errors.
              </p>
            </Card>
          </Link>
        ) : (
          <Card className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Operations
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Requires `SUPER_ADMIN` role.
            </p>
          </Card>
        )}
      </div>
    </section>
  );
}
