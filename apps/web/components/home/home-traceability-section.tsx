import Link from "next/link";

import { MockPanel } from "@/components/home/mock-panel";
import { SectionHeading } from "@/components/home/section-heading";
import { buttonClassName } from "@/components/ui/button";

const traceabilityPoints = [
  "Source and lot details appear first.",
  "QA checks and certifications stay grouped.",
  "Release status stays visible.",
];

export function HomeTraceabilitySection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:py-9">
      <div className="section-frame hidden px-5 py-5 sm:px-6 md:block">
        <SectionHeading
          eyebrow="Quality & Traceability"
          title="Quality you can trace."
          description="Verify production batches, ingredient sourcing, and release milestones in one place."
          descriptionClassName="hidden md:block"
          actionsClassName="w-full sm:w-auto"
          actions={
            <Link
              href="/traceability"
              className={buttonClassName({
                variant: "primary",
                className: "w-full sm:w-auto",
              })}
            >
              Open Traceability
            </Link>
          }
        />

        <div className="mt-6 hidden gap-4 md:grid lg:grid-cols-[1.08fr_0.92fr]">
          <MockPanel
            label="Batch Lookup Preview"
            title="Batch verification"
            description="Preview of the public lookup."
          >
            <div className="space-y-3">
              <div className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                  Batch code
                </p>
                <p className="mt-2 text-sm font-medium text-neutral-900">
                  NFL-BREAD-260301-A
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {["Source", "QA", "Dispatch"].map((step, index) => (
                  <div
                    key={step}
                    className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                      Step {index + 1}
                    </p>
                    <p className="mt-2 text-sm font-medium text-neutral-900">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                  Certification block
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["NAFDAC", "ISO 22000", "QA Release"].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[color:var(--border)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-neutral-600"
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
                className="rounded-[1.3rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4"
              >
                <p className="section-kicker">Step {index + 1}</p>
                <p className="pretty-text mt-3 text-sm leading-7 text-neutral-700">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="section-frame px-4 py-4.5 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="section-kicker">Quality & Traceability</p>
              <h2 className="mt-3 text-2xl font-semibold text-neutral-900">
                Quality you can trace.
              </h2>
            </div>
            <Link
              href="/traceability"
              className={buttonClassName({ variant: "secondary", size: "sm" })}
            >
              Open
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="rounded-[1.3rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                Batch code or QR value
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="min-w-0 flex-1 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm font-medium text-neutral-900">
                  NFL-BREAD-260301-A
                </div>
                <Link
                  href="/traceability"
                  className={buttonClassName({ variant: "primary", size: "sm" })}
                >
                  Verify
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Source", value: "Tracked" },
                { label: "QA", value: "Passed" },
                { label: "Release", value: "Ready" },
              ].map((step) => (
                <div
                  key={step.label}
                  className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-4"
                >
                  <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">
                    {step.label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-neutral-900">
                    {step.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {["NAFDAC", "ISO 22000"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-neutral-600"
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
