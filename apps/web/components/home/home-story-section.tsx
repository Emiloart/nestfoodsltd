import { CompanyFaqSection } from "@/components/company/company-faq-section";
import { CompanyStoryCarousel } from "@/components/company/company-story-carousel";

export function HomeStorySection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:py-9">
      <CompanyStoryCarousel />
      <div className="mt-7">
        <CompanyFaqSection />
      </div>
    </section>
  );
}
