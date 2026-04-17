"use client";

// Legacy public enquiry module retained temporarily while the corporate site
// converges on the primary contact route. The public /distributor-enquiry path
// now redirects to /contact.
import { FormEvent, useState } from "react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buttonClassName } from "@/components/ui/button";

type EnquiryPayload = {
  name: string;
  company: string;
  phone: string;
  email: string;
  region: string;
  expectedVolume: string;
  notes: string;
};

const initialState: EnquiryPayload = {
  name: "",
  company: "",
  phone: "",
  email: "",
  region: "",
  expectedVolume: "",
  notes: "",
};

export function DistributorEnquiryPageClient() {
  const [form, setForm] = useState<EnquiryPayload>(initialState);
  const [status, setStatus] = useState(
    "Share your company details and product interest. Nest Foods will follow up directly.",
  );
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setStatus("Submitting distributor enquiry...");

    const response = await fetch("/api/chat/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        company: form.company,
        phone: form.phone,
        email: form.email,
        message: [
          "Distributor enquiry",
          `Region: ${form.region}`,
          `Expected volume: ${form.expectedVolume}`,
          form.notes ? `Notes: ${form.notes}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        sourceIntent: "b2b_quote",
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to submit distributor enquiry.");
      setSubmitting(false);
      return;
    }

    setForm(initialState);
    setStatus("Distributor enquiry submitted. Nest Foods will follow up with your team directly.");
    setSubmitting(false);
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <Card className="space-y-4">
          <p className="section-kicker">Distributor Enquiry</p>
          <h1 className="display-heading text-4xl text-neutral-900 sm:text-[3.15rem]">
            Introduce your business to Nest Foods.
          </h1>
          <p className="pretty-text text-sm leading-7 text-neutral-600">
            Use this form to share your company details, operating region, and product interest so
            Nest Foods can respond directly.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Product catalogue review",
              "Regional coverage discussion",
              "Packaging and pack format questions",
              "Commercial follow-up",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4 text-sm text-neutral-700"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4 text-sm text-neutral-700">
            Nest Foods uses this enquiry route to start distributor conversations and coordinate
            direct follow-up.
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Enquiry Form
          </p>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void onSubmit(event)}>
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">Name</span>
              <Input
                required
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Full name"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                Company Name
              </span>
              <Input
                required
                value={form.company}
                onChange={(event) =>
                  setForm((current) => ({ ...current, company: event.target.value }))
                }
                placeholder="Company or retail group"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">Phone</span>
              <Input
                required
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
                placeholder="Phone number"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">Email</span>
              <Input
                required
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="Work email"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">Region</span>
              <Input
                required
                value={form.region}
                onChange={(event) =>
                  setForm((current) => ({ ...current, region: event.target.value }))
                }
                placeholder="Target region"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                Expected Volume
              </span>
              <Input
                required
                value={form.expectedVolume}
                onChange={(event) =>
                  setForm((current) => ({ ...current, expectedVolume: event.target.value }))
                }
                placeholder="Weekly or monthly volume"
              />
            </label>
            <label className="block space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">Notes</span>
              <textarea
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
                placeholder="Share product interest, packaging needs, or delivery context."
                className="field-control min-h-32 px-4 py-3 text-sm"
              />
            </label>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className={buttonClassName({
                  variant: "primary",
                  className: "disabled:cursor-not-allowed disabled:opacity-70",
                })}
              >
                {submitting ? "Submitting..." : "Submit Distributor Enquiry"}
              </button>
            </div>
          </form>

          <p className="text-sm text-neutral-600">{status}</p>
        </Card>
      </div>
    </section>
  );
}
