import Link from "next/link";

import { CareerApplicationForm } from "@/components/careers/career-application-form";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCompanyContent } from "@/lib/company/service";
import { cmsPageMetadata } from "@/lib/cms/metadata";
import { getCmsPage } from "@/lib/cms/service";

export default async function CareersPage() {
  const [page, company] = await Promise.all([getCmsPage("careers"), getCompanyContent()]);
  const careers = company.careers;

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 md:px-6">
      <div className="section-frame px-5 py-7 sm:px-6 sm:py-8">
        <Badge>Careers</Badge>
        <h1 className="display-heading mt-4 text-4xl text-neutral-900 sm:text-5xl">
          {page.headline}
        </h1>
        <p className="pretty-text mt-4 max-w-3xl text-[0.98rem] leading-7 text-neutral-600">
          {careers.intro}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`mailto:${careers.hrEmail}`}
            className={buttonClassName({ variant: "primary" })}
          >
            Email HR
          </Link>
          <Link href={`tel:${careers.hrPhone}`} className={buttonClassName({ variant: "secondary" })}>
            Call HR
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="space-y-3">
          <p className="section-kicker">Roles</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {careers.roles.map((role) => (
              <div
                key={role}
                className="rounded-[1.1rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-neutral-700"
              >
                {role}
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3">
          <p className="section-kicker">Application Requirements</p>
          <ul className="space-y-2 text-sm text-neutral-700">
            {careers.applicationRequirements.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <p className="section-kicker">HR Contact</p>
          <p className="text-sm text-neutral-700">Email: {careers.hrEmail}</p>
          <p className="text-sm text-neutral-700">Phone: {careers.hrPhone}</p>
        </Card>
        <Card className="space-y-3">
          <p className="section-kicker">Equal Opportunity</p>
          {careers.equalOpportunity.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-7 text-neutral-700">
              {paragraph}
            </p>
          ))}
        </Card>
      </div>

      <Card className="space-y-4">
        <p className="section-kicker">Online Application</p>
        <p className="text-sm leading-7 text-neutral-700">
          Applicants outside Anambra State can send their details to HR from this form. Attach your
          CV and application letter before sending. Drivers should also attach a driver's license
          or cover letter where applicable.
        </p>
        <CareerApplicationForm />
      </Card>
    </section>
  );
}

export async function generateMetadata() {
  const page = await getCmsPage("careers", { preview: true });
  return cmsPageMetadata(page, { path: "/careers" });
}
