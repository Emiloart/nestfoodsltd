import { ImagePlaceholder } from "@/components/image-placeholder";
import { MobileAutoCarousel } from "@/components/home/mobile-auto-carousel";
import { SectionHeading } from "@/components/home/section-heading";
import { TRUST_CERTIFICATIONS } from "@/lib/company/contact";

const standards = [
  {
    title: "Controlled baking process",
    description:
      "Uniform crumb, dependable slicing, and repeatable output across daily production.",
  },
  {
    title: "Hygienic production routines",
    description:
      "Clean handling, routine checks, and disciplined quality oversight guide each shift.",
  },
  {
    title: "Packaging discipline",
    description:
      "Finished loaves are packed for clear presentation and dependable handling.",
  },
];

export function HomeProductionStandardsSection() {
  const standardCards = standards.map((item) => (
    <div
      key={item.title}
      className="rounded-[1.3rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-5"
    >
      <h3 className="text-lg font-semibold text-neutral-900">{item.title}</h3>
      <p className="pretty-text mt-3 text-sm leading-7 text-neutral-600">{item.description}</p>
    </div>
  ));
  const trustCards = TRUST_CERTIFICATIONS.map((item) => (
    <div
      key={item.label}
      className="rounded-[1.3rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4"
    >
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[color:var(--bg-accent-gold)] text-sm font-black text-[color:var(--brand-2)]">
        {item.label}
      </div>
      <h3 className="mt-4 text-base font-semibold text-neutral-900">{item.title}</h3>
      <p className="pretty-text mt-2 text-sm leading-6 text-neutral-600">{item.body}</p>
    </div>
  ));

  return (
    <section
      id="production-standards"
      className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:py-9"
    >
      <div className="section-frame px-5 py-5 sm:px-6 md:hidden">
        <SectionHeading
          eyebrow="Production Standards"
          title="Production standards built into daily operations."
          description="Process control, hygiene, and packaging discipline."
          descriptionClassName="hidden"
        />

        <div className="placeholder-panel mt-5 p-3">
            <ImagePlaceholder
              src="/placeholders/sections/section-image-placeholder.svg"
              alt="Production process visual"
              label="Production Process"
              className="aspect-[16/11]"
            />
        </div>

        <MobileAutoCarousel
          ariaLabel="Production standards"
          className="mt-5"
          intervalMs={2000}
          items={[...standardCards, ...trustCards]}
        />
      </div>

      <div className="hidden gap-5 md:grid lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="section-frame px-5 py-5 sm:px-6">
          <SectionHeading
            eyebrow="Production Standards"
            title="Production process, hygiene, packaging, and trust signals."
            description="Nest Foods Limited presents manufacturing standards, regulatory trust markers, and controlled factory routines for De-Nest Bread."
            descriptionClassName="hidden lg:block"
          />

          <div className="mt-6 grid gap-3">{standardCards}</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{trustCards}</div>
        </div>

        <div className="section-frame space-y-4 p-4 sm:p-5">
          <ImagePlaceholder
            src="/placeholders/sections/section-image-placeholder.svg"
            alt="Production process visual"
            label="Production Process"
            className="aspect-[6/5] sm:aspect-[16/11]"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <ImagePlaceholder
              src="/placeholders/sections/process-placeholder.svg"
              alt="Factory process video preview"
              label="Factory Process"
              className="aspect-video"
            />
            <ImagePlaceholder
              src="/placeholders/sections/section-image-placeholder.svg"
              alt="Quality control team visual"
              label="Quality Team"
              className="aspect-video"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
