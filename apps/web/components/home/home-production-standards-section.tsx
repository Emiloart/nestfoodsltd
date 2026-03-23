import { ImagePlaceholder } from "@/components/image-placeholder";
import { SectionHeading } from "@/components/home/section-heading";

const standards = [
  {
    title: "Industrial consistency",
    description: "Product presentation now speaks to uniform crumb, clean slicing, and stable shelf-ready output.",
  },
  {
    title: "Hygienic workflow",
    description: "The public narrative foregrounds disciplined production and quality assurance rather than storefront mechanics.",
  },
  {
    title: "Packaging integrity",
    description: "Clearer messaging for retail-ready packaging, handling confidence, and distributor movement.",
  },
];

export function HomeProductionStandardsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="section-frame px-5 py-6 sm:px-6 sm:py-7">
          <SectionHeading
            eyebrow="Production Standards"
            title="Manufacturing discipline should be visible before any buyer reaches the portal layer."
            description="This section shifts the public emphasis toward bread production standards, packaging control, and dependable operational quality."
          />

          <div className="mt-6 grid gap-3">
            {standards.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.3rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-5"
              >
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {item.title}
                </h3>
                <p className="pretty-text mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
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
