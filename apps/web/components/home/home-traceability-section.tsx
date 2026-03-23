import Link from "next/link";

import { MockPanel } from "@/components/home/mock-panel";
import { SectionHeading } from "@/components/home/section-heading";

const traceabilityPoints = [
  "Source and lot details are visible immediately.",
  "QA status and certifications stay grouped together.",
  "Dispatch status is readable without extra clicks.",
];

export function HomeTraceabilitySection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <div className="section-frame hidden px-5 py-6 sm:px-6 sm:py-7 md:block">
        <SectionHeading
          eyebrow="Quality & Traceability"
          title="Check quality before purchase or enquiry."
          description="The traceability flow stays simple on mobile and deeper on the dedicated page."
          descriptionClassName="hidden md:block"
          actionsClassName="w-full sm:w-auto"
          actions={
            <Link
              href="/traceability"
              className="inline-flex w-full justify-center rounded-full bg-[linear-gradient(135deg,var(--brand-1),var(--brand-2))] px-5 py-3 text-xs font-medium uppercase tracking-[0.15em] text-white transition hover:-translate-y-0.5 hover:brightness-105 sm:w-auto"
            >
              Open Traceability
            </Link>
          }
        />

        <div className="mt-6 grid gap-4 md:hidden">
          <MockPanel
            label="Batch Lookup Preview"
            title="Fast mobile verification"
            description="One code reveals source, QA, and release status."
            descriptionClassName="text-sm leading-6"
          >
            <div className="space-y-3">
              <div className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
                  Batch code
                </p>
                <p className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  NFL-BREAD-260301-A
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Source", value: "Tracked" },
                  { label: "QA", value: "Passed" },
                  { label: "Dispatch", value: "Visible" },
                ].map((step) => (
                  <div
                    key={step.label}
                    className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-4"
                  >
                    <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                      {step.label}
                    </p>
                    <p className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {step.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </MockPanel>
        </div>

        <div className="mt-6 hidden gap-4 md:grid lg:grid-cols-[1.08fr_0.92fr]">
          <MockPanel
            label="Batch Lookup Preview"
            title="Readable verification surface"
            description="Placeholder preview for the public batch verification interface."
          >
            <div className="space-y-3">
              <div className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
                  Batch code
                </p>
                <p className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  NFL-BREAD-260301-A
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {["Source", "QA", "Dispatch"].map((step, index) => (
                  <div
                    key={step}
                    className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
                      Step {index + 1}
                    </p>
                    <p className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
                  Certification block
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["NAFDAC", "ISO 22000", "QA Release"].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[color:var(--border)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-neutral-600 dark:text-neutral-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </MockPanel>

          <div className="grid gap-3">
            {traceabilityPoints.map((point, index) => (
              <div
                key={point}
                className="rounded-[1.3rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-5"
              >
                <p className="section-kicker">Step {index + 1}</p>
                <p className="pretty-text mt-3 text-sm leading-7 text-neutral-700 dark:text-neutral-200">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="section-frame px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="section-kicker">Quality & Traceability</p>
              <h2 className="mt-3 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                Verify a batch before you enquire.
              </h2>
            </div>
            <Link
              href="/traceability"
              className="inline-flex shrink-0 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-900 dark:text-neutral-100"
            >
              Open
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="rounded-[1.3rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                    Batch code
                  </p>
                  <p className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    NFL-BREAD-260301-A
                  </p>
                </div>
                <span className="rounded-full bg-[linear-gradient(135deg,var(--brand-1),var(--brand-2))] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white">
                  Ready
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Source", value: "Tracked" },
                { label: "QA", value: "Passed" },
                { label: "Dispatch", value: "Visible" },
              ].map((step) => (
                <div
                  key={step.label}
                  className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-4"
                >
                  <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                    {step.label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {step.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {["NAFDAC", "ISO 22000", "QA Release"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-neutral-600 dark:text-neutral-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
