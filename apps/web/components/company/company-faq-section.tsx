import { Card } from "@/components/ui/card";
import { type CompanyFaq } from "@/lib/company/types";

export function CompanyFaqSection({ faqs }: { faqs: CompanyFaq[] }) {
  return (
    <section className="space-y-4">
      <div>
        <p className="section-kicker">FAQ</p>
      </div>
      <Card className="divide-y divide-[color:var(--border)] p-0">
        {faqs.map((item, index) => (
          <details key={item.question} className="group px-4 py-4 open:bg-[color:var(--surface-elevated)] sm:px-5">
            <summary className="flex cursor-pointer list-none items-start gap-3 text-left">
              <span className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[color:var(--brand-1)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-base font-semibold text-neutral-900">
                {item.question}
              </span>
              <span className="text-lg leading-none text-[color:var(--brand-1)] transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="pretty-text mt-3 pl-9 text-sm leading-7 text-neutral-600">
              {item.answer}
            </p>
          </details>
        ))}
      </Card>
    </section>
  );
}
