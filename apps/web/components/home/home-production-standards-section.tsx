import Image from "next/image";

import { SectionHeading } from "@/components/home/section-heading";
import { type CompanyTrustCertification } from "@/lib/company/types";

export function HomeProductionStandardsSection({
  trustCertifications,
}: {
  trustCertifications: CompanyTrustCertification[];
}) {
  // Quality control is an internal process, rather than an external certification logo.
  const credentials = trustCertifications.filter((item) => item.label.toUpperCase() !== "QC");
  if (!credentials.length) return null;

  return (
    <section
      id="production-standards"
      className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:py-9"
    >
      <SectionHeading eyebrow="Standards" title="Production Credentials" />
      <div className="certification-marquee mt-6 overflow-hidden py-4">
        <div className="certification-carousel-track flex w-max">
          {[false, true].map((duplicate) => (
            <div
              key={String(duplicate)}
              aria-hidden={duplicate || undefined}
              className="certification-logo-group flex shrink-0 items-center justify-around gap-12 pr-12 md:gap-20 md:pr-20"
            >
              {credentials.map((item) => (
                <Image
                  key={item.label}
                  src={item.logoUrl}
                  alt={duplicate ? "" : `${item.label} — ${item.title}`}
                  title={duplicate ? undefined : item.body}
                  width={180}
                  height={96}
                  className="h-20 w-36 shrink-0 object-contain md:h-24 md:w-44"
                  unoptimized
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
