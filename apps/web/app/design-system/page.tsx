"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";

const colorTokens = [
  {
    name: "Primary Purple",
    role: "Structural brand color for shells, emphasis, and headings.",
    hex: "#5A247A",
    className: "bg-[color:var(--brand-1)] text-white",
  },
  {
    name: "Deep Purple",
    role: "Support color for footer chrome, restrained contrast, and internal framing.",
    hex: "#2E1245",
    className: "bg-[color:var(--brand-2)] text-white",
  },
  {
    name: "Accent Yellow",
    role: "Primary CTA fill and selective attention accent.",
    hex: "#F4E409",
    className: "bg-[color:var(--action-1)] text-[color:var(--action-text)]",
  },
  {
    name: "Support Gold",
    role: "Secondary accent for restrained highlights, labels, and supporting emphasis.",
    hex: "#EEBA0B",
    className: "bg-[color:var(--brand-4)] text-[color:var(--action-text)]",
  },
  {
    name: "Milk Canvas",
    role: "Primary page background for light, food-friendly section rhythm.",
    hex: "#F5EFE6",
    className: "bg-[color:var(--surface)] text-[color:var(--foreground)]",
  },
  {
    name: "Warm White",
    role: "Elevated card and form surface that keeps the shared UI breathable.",
    hex: "#FCF7F0",
    className: "bg-[color:var(--surface-elevated)] text-[color:var(--foreground)]",
  },
];

const typographyScale = [
  {
    label: "Display XL",
    className: "display-heading text-5xl text-neutral-900 sm:text-6xl",
    sample: "Bread production built for consistency.",
  },
  {
    label: "Section Heading",
    className: "display-heading text-3xl text-neutral-900",
    sample: "Quality systems that look credible.",
  },
  {
    label: "Body",
    className: "text-base leading-7 text-neutral-700",
    sample:
      "Body copy should stay operational, concise, and institutional, with enough breathing room to feel premium.",
  },
  {
    label: "Kicker",
    className: "section-kicker",
    sample: "Manufacturing credibility first",
  },
];

const spacingScale = [
  { name: "Section rhythm", value: "4rem-6.5rem", note: "Primary vertical spacing between homepage blocks." },
  { name: "Card padding", value: "1.25rem-2rem", note: "Adaptive card and panel padding token." },
  { name: "Container width", value: "80rem", note: "Maximum public content shell width." },
];

export default function DesignSystemPage() {
  const [open, setOpen] = useState(false);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 md:px-6">
      <div className="space-y-3">
        <Badge>Design System</Badge>
        <h1 className="display-heading text-4xl text-neutral-900 sm:text-5xl">
          Nest Foods UI Foundations
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-neutral-600">
          A restrained purple-and-gold manufacturer system built on milk and white surfaces. The
          same token layer drives the public website and the admin CMS, so shell color stays
          branded while forms and cards remain light.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <div className="space-y-2">
            <p className="section-kicker">Color System</p>
            <h2 className="display-heading text-2xl text-neutral-900">
              Brand palette
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            {colorTokens.map((token) => (
              <div key={token.name} className="space-y-3">
                <div className={`rounded-[1.4rem] px-4 py-10 shadow-[0_16px_34px_rgba(46,18,69,0.12)] ${token.className}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em]">{token.hex}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-900">
                    {token.name}
                  </p>
                  <p className="text-xs leading-6 text-neutral-600">
                    {token.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="space-y-2">
            <p className="section-kicker">Brand Chrome</p>
            <h2 className="display-heading text-2xl text-neutral-900">
              Header and footer treatment
            </h2>
          </div>
          <div className="brand-shell rounded-[1.75rem] border p-5">
            <div className="flex items-center justify-between gap-3 rounded-[1.1rem] border border-white/10 bg-white/6 px-4 py-3">
              <div>
                <p className="section-kicker text-[color:var(--brand-4)]">Nest Foods Ltd</p>
                <p className="text-sm text-white">Premium bread manufacturing.</p>
              </div>
              <Button size="sm">Make Enquiry</Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Products", "About", "Careers", "Contact"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs text-white/78"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4">
          <div className="space-y-2">
            <p className="section-kicker">Typography</p>
            <h2 className="display-heading text-2xl text-neutral-900">
              Clear hierarchy
            </h2>
          </div>
          <div className="space-y-5">
            {typographyScale.map((item) => (
              <div key={item.label} className="space-y-2 border-b border-[color:var(--border)] pb-4 last:border-b-0 last:pb-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  {item.label}
                </p>
                <p className={item.className}>{item.sample}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="space-y-2">
            <p className="section-kicker">Buttons</p>
            <h2 className="display-heading text-2xl text-neutral-900">
              Action language
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="brand">Brand</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="sm">Small CTA</Button>
            <Button size="md" variant="secondary">
              Standard CTA
            </Button>
            <Button size="lg" variant="brand">
              Large CTA
            </Button>
          </div>
          <p className="text-sm leading-7 text-neutral-600">
            Milk and white should dominate the viewport. Yellow is reserved for the main action,
            while purple fill stays limited to brand-led emphasis and shell moments.
          </p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-4">
          <div className="space-y-2">
            <p className="section-kicker">Form Controls</p>
            <h2 className="display-heading text-2xl text-neutral-900">
              Input surfaces
            </h2>
          </div>
          <div className="space-y-3">
            <Input placeholder="Search products, pages, or CMS content..." />
            <select className="field-control h-11 px-3 text-sm">
              <option>Pack format</option>
              <option>Large loaf</option>
              <option>Family sliced</option>
            </select>
            <textarea
              className="field-control min-h-28 px-4 py-3 text-sm"
              placeholder="Capture a product enquiry, editorial note, or CMS handoff."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>Premium</Badge>
            <Badge className="text-[color:var(--brand-1)]">Controlled Production</Badge>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="space-y-2">
            <p className="section-kicker">Spacing & Layout</p>
            <h2 className="display-heading text-2xl text-neutral-900">
              Structured rhythm
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {spacingScale.map((token) => (
              <div
                key={token.name}
                className="rounded-[1.2rem] border border-[color:var(--border-strong)] bg-[color:var(--surface-strong)] px-4 py-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  {token.name}
                </p>
                <p className="mt-2 display-heading text-2xl text-neutral-900">
                  {token.value}
                </p>
                <p className="mt-2 text-xs leading-6 text-neutral-600">
                  {token.note}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-[1.4rem] border border-[color:var(--border-strong)] bg-[color:var(--surface-strong)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              12-column reference
            </p>
            <div className="mt-4 grid grid-cols-6 gap-2 md:grid-cols-12">
              {Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-accent)]"
                />
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="space-y-4">
          <div className="space-y-2">
            <p className="section-kicker">Loading States</p>
            <h2 className="display-heading text-2xl text-neutral-900">
              Calm placeholders
            </h2>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="space-y-2">
            <p className="section-kicker">Modal</p>
            <h2 className="display-heading text-2xl text-neutral-900">
              Reusable interaction layer
            </h2>
          </div>
          <p className="text-sm leading-7 text-neutral-600">
            Use for confirmations, supporting detail, or operational disclosure without crowding the
            page shell.
          </p>
          <Button variant="brand" onClick={() => setOpen(true)}>
            Open Modal
          </Button>
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nest Foods UI System">
        <p className="text-sm leading-7 text-neutral-600">
          The shared system is tuned for a manufacturer identity: structural purple shells,
          milk-first surfaces, restrained gold support, and direct action language.
        </p>
      </Modal>
    </section>
  );
}
