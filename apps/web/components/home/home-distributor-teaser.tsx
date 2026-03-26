import Link from "next/link";

const partnerHighlights = [
  "Approved distributor access",
  "Bulk quote review",
  "Invoices and support",
];

export function HomeDistributorTeaser() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:py-9">
      <div className="section-frame px-5 py-5 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl">
            <p className="section-kicker">Distributor Partnership</p>
            <h2 className="display-heading mt-3 text-3xl text-neutral-900 dark:text-neutral-100 sm:text-4xl">
              Distributor access, kept secondary.
            </h2>
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
