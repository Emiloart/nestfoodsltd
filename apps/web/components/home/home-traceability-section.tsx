import Link from "next/link";

import { MockPanel } from "@/components/home/mock-panel";
import { SectionHeading } from "@/components/home/section-heading";

const traceabilityPoints = [
  "Source references and lot identifiers stay visible.",
  "Processing, QA, and distribution checkpoints are grouped into a readable journey.",
  "Certifications and release milestones reinforce trust for retail and distributor buyers.",
];

export function HomeTraceabilitySection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <div className="section-frame px-5 py-6 sm:px-6 sm:py-7">
        <SectionHeading
          eyebrow="Quality & Traceability"
          title="One of the strongest platform features is now positioned as a brand differentiator."
          description="Traceability is not decorative here. It is a public proof layer for product quality, manufacturing discipline, and partner confidence."
          actions={
            <Link
              href="/traceability"
              className="inline-flex rounded-full bg-[linear-gradient(135deg,var(--brand-1),var(--brand-2))] px-5 py-3 text-xs font-medium uppercase tracking-[0.15em] text-white transition hover:-translate-y-0.5 hover:brightness-105"
            >
              Open Traceability
            </Link>
          }
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
          <MockPanel
            label="Batch Lookup Preview"
            title="Readable verification surface"
            description="Placeholder only. This block previews how the batch lookup interface can be surfaced publicly."
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
                {["Sourcing", "Processing", "Quality", "Distribution"].map((step, index) => (
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
            {traceabilityPoints.map((point) => (
              <div
                key={point}
                className="rounded-[1.3rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-5"
              >
                <p className="pretty-text text-sm leading-7 text-neutral-700 dark:text-neutral-200">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
