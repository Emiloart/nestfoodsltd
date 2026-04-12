import { ImagePlaceholder } from "@/components/image-placeholder";
import { MobileAutoCarousel } from "@/components/home/mobile-auto-carousel";
import { SectionHeading } from "@/components/home/section-heading";

const standards = [
  {
    title: "Industrial baking process",
    description: "Uniform crumb, clean slicing, and dependable output at scale.",
  },
  {
    title: "Clean production environment",
    description: "Production and QA stay visible across the public experience.",
  },
  {
    title: "Consistent packaging standards",
    description: "Packaging stays dependable for downstream handling and display.",
  },
];

export function HomeProductionStandardsSection() {
  const standardCards = standards.map((item) => (
    <div
      key={item.title}
      className="rounded-[1.3rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-5"
    >
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{item.title}</h3>
      <p className="pretty-text mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
        {item.description}
      </p>
    </div>
  ));

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:py-9">
      <div className="section-frame px-5 py-5 sm:px-6 md:hidden">
        <SectionHeading
          eyebrow="Production Process"
          title="Industrial baking standards made visible."
          description="Process, hygiene, and packaging."
          descriptionClassName="hidden"
        />

        <div className="placeholder-panel mt-5 p-3">
          <ImagePlaceholder
            src="/placeholders/section-image-placeholder.svg"
            alt="Production process placeholder"
            label="Factory / Process Placeholder"
            className="aspect-[16/11]"
          />
        </div>

        <MobileAutoCarousel
          ariaLabel="Production standards"
          className="mt-5"
          intervalMs={2000}
          items={standardCards}
        />
      </div>

      <div className="hidden gap-5 md:grid lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="section-frame px-5 py-5 sm:px-6">
          <SectionHeading
            eyebrow="Production Process"
            title="Industrial baking process, hygiene, and packaging."
            description="Clean production environment with clear standards."
            descriptionClassName="hidden lg:block"
          />

          <div className="mt-6 grid gap-3">{standardCards}</div>
        </div>

        <div className="section-frame p-4 sm:p-5">
          <ImagePlaceholder
            src="/placeholders/section-image-placeholder.svg"
            alt="Production process placeholder"
            label="Factory / Process Placeholder"
            className="aspect-[6/5] sm:aspect-[16/11]"
          />
        </div>
      </div>
    </section>
  );
}
