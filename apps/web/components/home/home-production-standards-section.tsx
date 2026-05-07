import Image from "next/image";

import { MobileAutoCarousel } from "@/components/home/mobile-auto-carousel";
import { SectionHeading } from "@/components/home/section-heading";
import { TRUST_CERTIFICATIONS } from "@/lib/company/contact";

function CertificationCard({
  label,
  title,
  body,
  logoUrl,
}: {
  label: string;
  title: string;
  body: string;
  logoUrl: string;
}) {
  return (
    <article className="w-full min-w-[18rem] rounded-[1.3rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-5 py-5">
      <div className="mb-4">
        <Image
          src={logoUrl}
          alt={`${label} logo`}
          width={160}
          height={80}
          className="h-16 w-auto rounded-lg border border-[color:var(--border)] bg-white p-1.5 object-contain"
          unoptimized
        />
      </div>
      <h3 className="text-xl font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-neutral-600">{body}</p>
    </article>
  );
}

export function HomeProductionStandardsSection() {
  const cards = TRUST_CERTIFICATIONS.map((item) => (
    <CertificationCard key={item.label} {...item} />
  ));
  const desktopCards = [...TRUST_CERTIFICATIONS, ...TRUST_CERTIFICATIONS];

  return (
    <section
      id="production-standards"
      className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:py-9"
    >
      <SectionHeading eyebrow="Standards" title="Production Credentials" description="" />

      <MobileAutoCarousel
        ariaLabel="Production credentials"
        className="mt-4"
        intervalMs={2400}
        items={cards}
      />

      <div className="group mt-4 hidden overflow-hidden md:block">
        <div className="certification-carousel-track flex w-max items-stretch gap-4 group-hover:[animation-play-state:paused]">
          {desktopCards.map((item, index) => (
            <CertificationCard
              key={`${item.label}-${index}`}
              label={item.label}
              title={item.title}
              body={item.body}
              logoUrl={item.logoUrl}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
