import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-3">
        <Badge>Admin Workspace</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Operations Dashboard
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Secure control plane for dynamic content, catalog management, media, and operations.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/content" className="block transition hover:-translate-y-1">
          <Card className="space-y-2">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Content Manager</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Edit Home, About, Vision, Contact, Careers, and Sustainability content.
            </p>
          </Card>
        </Link>
        <Card className="space-y-2">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Catalog Manager</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Next milestone: products, variants, nutrition, allergens, and SEO fields.
          </p>
        </Card>
        <Card className="space-y-2">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Order Control</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Next milestone: order states, payment events, and customer support workflows.
          </p>
        </Card>
      </div>
    </section>
  );
}
