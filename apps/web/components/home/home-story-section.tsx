import { CompanyFaqSection } from "@/components/company/company-faq-section";
import { CompanyStoryCarousel } from "@/components/company/company-story-carousel";
import { type CompanyContent } from "@/lib/company/types";

export function HomeStorySection({ company }: { company: CompanyContent }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-0 py-6 md:px-6 md:py-8 lg:py-9">
      <CompanyStoryCarousel company={company} />
      <div className="mt-7 px-4 md:px-0">
        <CompanyFaqSection faqs={company.faqs} />
      </div>
    </section>
  );
}
