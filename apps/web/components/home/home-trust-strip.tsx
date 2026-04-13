import { MobileAutoCarousel } from "@/components/home/mobile-auto-carousel";

const trustItems = [
  {
    title: "Registered Food Manufacturer",
    description: "Licensed bread production with public-facing credibility.",
  },
  {
    title: "Hygienic Production Standards",
    description: "Clean workflow, disciplined QA, and safe handling.",
  },
  {
    title: "Reliable Distributor Supply",
    description: "Regional supply readiness for partner conversations.",
  },
  {
    title: "Premium Ingredients",
    description: "Ingredient clarity across the product catalogue.",
  },
];

export function HomeTrustStrip() {
  const slides = trustItems.map((item) => (
    <div key={item.title} className="section-frame px-4 py-4.5 sm:px-5">
      <p className="section-kicker">Trust Signal</p>
      <h2 className="mt-3 text-lg font-semibold text-neutral-900">
        {item.title}
      </h2>
      <p className="pretty-text mt-3 text-sm leading-7 text-neutral-600">
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
