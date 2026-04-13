import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";

const partnerHighlights = [
  "Distributor and retail enquiries",
  "Approved partner portal access",
  "Regional supply planning",
  "Expected volume discussions",
];

export function HomeDistributorTeaser() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:py-9">
      <div className="section-frame px-5 py-5 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl">
            <p className="section-kicker">Distributor Partnership</p>
            <h2 className="display-heading mt-3 text-3xl text-neutral-900 sm:text-4xl">
              Partner with Nest Foods for distributor supply enquiries.
            </h2>
            <p className="pretty-text mt-4 max-w-2xl text-sm leading-7 text-neutral-600">
              Start with a public enquiry if you are exploring supply. Approved distributors can
              continue through the partner portal for account coordination and support.
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

          <Link
            href="/distributor-enquiry"
            className={buttonClassName({ variant: "primary" })}
          >
            Distributor Enquiry
          </Link>
        </div>
      </div>
    </section>
  );
}
