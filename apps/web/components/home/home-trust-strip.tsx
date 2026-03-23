const trustItems = [
  {
    title: "Registered Manufacturer",
    description: "A more corporate public face for regulated product manufacturing and supply.",
  },
  {
    title: "Hygienic Standards",
    description: "Production messaging now emphasizes clean workflows, packaging integrity, and QA.",
  },
  {
    title: "Reliable Supply",
    description: "Public buyers and partners can understand regional availability and scale readiness.",
  },
  {
    title: "Quality Ingredients",
    description: "Ingredient transparency and product consistency stay visible across the site.",
  },
];

export function HomeTrustStrip() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-6 md:px-6">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {trustItems.map((item) => (
          <div
            key={item.title}
            className="section-frame px-5 py-5"
          >
            <p className="section-kicker">Trust Signal</p>
            <h2 className="mt-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {item.title}
            </h2>
            <p className="pretty-text mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
