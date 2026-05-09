import { COMPANY_FAQS } from "@/lib/company/about";

export function CompanyFaqSection() {
  return (
    <section className="space-y-4">
      <div>
        <p className="section-kicker">Frequently Asked Questions</p>
        <h2 className="display-heading mt-3 text-3xl text-neutral-900 sm:text-4xl">
          Frequently Asked Questions
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {COMPANY_FAQS.map((item, index) => (
          <article
            key={item.question}
            className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 shadow-[0_12px_26px_rgba(46,18,69,0.06)]"
          >
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[color:var(--brand-1)]">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-2 text-base font-semibold text-neutral-900">{item.question}</h3>
            <p className="pretty-text mt-2 text-sm leading-7 text-neutral-600">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
