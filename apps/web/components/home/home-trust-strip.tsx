import { MobileAutoCarousel } from "@/components/home/mobile-auto-carousel";

const trustItems = [
  {
    title: "Registered Manufacturer",
    description: "Licensed bread production.",
  },
  {
    title: "Hygienic Standards",
    description: "Clean workflow and QA control.",
  },
  {
    title: "Reliable Supply",
    description: "Regional supply readiness.",
  },
  {
    title: "Quality Ingredients",
    description: "Ingredient clarity across the range.",
  },
];

export function HomeTrustStrip() {
  const slides = trustItems.map((item) => (
    <div key={item.title} className="section-frame px-4 py-4.5 sm:px-5">
      <p className="section-kicker">Trust Signal</p>
      <h2 className="mt-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        {item.title}
      </h2>
      <p className="pretty-text mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
        {item.description}
      </p>
    </div>
  ));

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-4 md:px-6 md:pb-5">
      <MobileAutoCarousel ariaLabel="Trust signals" items={slides} />

      <div className="hidden gap-3 md:grid md:grid-cols-2 xl:grid-cols-4">{slides}</div>
    </section>
  );
}
