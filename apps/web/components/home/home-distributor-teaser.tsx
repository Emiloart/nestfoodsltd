import Link from "next/link";

const partnerHighlights = [
  "Approved distributor access",
  "Bulk quote review and staged supply planning",
  "Invoices, statements, and support workflows behind the CTA",
];

export function HomeDistributorTeaser() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <div className="section-frame px-5 py-6 sm:px-6 sm:py-7">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl">
            <p className="section-kicker">Distributor Partnership</p>
            <h2 className="display-heading mt-3 text-3xl text-neutral-900 dark:text-neutral-100 sm:text-4xl">
              Partner access stays strong, but secondary.
            </h2>
            <p className="pretty-text mt-4 hidden text-sm leading-7 text-neutral-600 dark:text-neutral-300 md:block">
              The portal remains a strong conversion path, but it now reads as a partner workflow
              instead of the homepage identity.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {partnerHighlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-neutral-600 dark:text-neutral-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <Link
            href="/b2b"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--brand-1),var(--brand-2))] px-6 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:brightness-105"
          >
            Open Distributor Portal
          </Link>
        </div>
      </div>
    </section>
  );
}
