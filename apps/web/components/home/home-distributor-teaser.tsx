import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";

// Legacy homepage section retained temporarily for migration safety. The
// corporate homepage no longer mounts this section and distributor-first
// messaging should not return to the public shell.

const partnerHighlights = [
  "Distributor introductions",
  "Product range discussions",
  "Regional coverage conversations",
  "Packaging and service enquiries",
];

export function HomeDistributorTeaser() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:py-9">
      <div className="section-frame px-5 py-5 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl">
            <p className="section-kicker">Distributor Enquiry</p>
            <h2 className="display-heading mt-3 text-3xl text-neutral-900 sm:text-4xl">
              Start distributor conversations with the Nest Foods team.
            </h2>
            <p className="pretty-text mt-4 max-w-2xl text-sm leading-7 text-neutral-600">
              Use the enquiry route to introduce your business, operating region, and product
              interest. Nest Foods will follow up directly on fit, next steps, and contact routing.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {partnerHighlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-neutral-600"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <Link href="/distributor-enquiry" className={buttonClassName({ variant: "primary" })}>
            Make Distributor Enquiry
          </Link>
        </div>
      </div>
    </section>
  );
}
