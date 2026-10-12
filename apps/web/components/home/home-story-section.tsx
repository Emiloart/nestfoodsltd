import Link from "next/link";
import { CompanyFaqSection } from "@/components/company/company-faq-section";
import { buttonClassName } from "@/components/ui/button";
import { type CompanyContent } from "@/lib/company/types";

export function HomeStorySection({ company }: { company: CompanyContent }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
      <div className="rounded-2xl bg-[color:var(--brand-2)] p-6 text-white sm:p-8">
        <p className="text-sm font-semibold text-[color:var(--brand-3)]">
          About Nest Foods Limited
        </p>
        <h2 className="display-heading mt-3 text-3xl sm:text-4xl">
          A Nigerian bakery built on quality.
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-8 text-white/90">{company.story[0]}</p>
        <Link href="/about" className={buttonClassName({ variant: "primary", className: "mt-6" })}>
          Our story and values
        </Link>
      </div>
      <div className="mt-7">
        <CompanyFaqSection faqs={company.faqs.slice(0, 3)} />
      </div>
    </section>
  );
}
