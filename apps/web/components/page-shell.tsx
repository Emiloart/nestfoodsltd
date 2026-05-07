type PageShellProps = {
  title: string;
  headline?: string;
  description: string;
};

export function PageShell({ title, headline, description }: PageShellProps) {
  return (
    <section className="hero-ripple mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <div className="section-frame px-5 py-7 sm:px-6 sm:py-8">
        <p className="section-kicker">{title}</p>
        <h1 className="display-heading mt-4 text-4xl text-neutral-900 sm:text-5xl">
          {headline ?? title}
        </h1>
        <p className="pretty-text mt-4 max-w-2xl text-[0.98rem] leading-7 text-neutral-600">
          {description}
        </p>
      </div>
    </section>
  );
}
