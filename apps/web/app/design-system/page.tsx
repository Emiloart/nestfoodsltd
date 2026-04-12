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
    role: "Depth color for gradients, footer chrome, and overlays.",
    hex: "#2E1245",
    className: "bg-[color:var(--brand-2)] text-white",
  },
  {
    name: "Warm Gold",
    role: "Primary CTA fill and high-contrast action accent.",
    hex: "#F4E409",
    className: "bg-[color:var(--brand-3)] text-[color:var(--action-text)]",
  },
  {
    name: "Gold Ochre",
    role: "Supporting highlight for gradients and button depth.",
    hex: "#EEBA0B",
    className: "bg-[color:var(--brand-4)] text-[color:var(--action-text)]",
  },
  {
    name: "Warm Neutral",
    role: "Primary page canvas and card balance tone.",
    hex: "#FAF6EF",
    className: "bg-[color:var(--surface)] text-[color:var(--foreground)]",
  },
];

const typographyScale = [
  {
    label: "Display XL",
    className: "display-heading text-5xl text-neutral-900 dark:text-neutral-50 sm:text-6xl",
    sample: "Bread production built for consistency.",
  },
  {
    label: "Section Heading",
    className: "display-heading text-3xl text-neutral-900 dark:text-neutral-100",
    sample: "Quality systems that look credible.",
  },
  {
    label: "Body",
    className: "text-base leading-7 text-neutral-700 dark:text-neutral-300",
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
        <h1 className="display-heading text-4xl text-neutral-900 dark:text-neutral-100 sm:text-5xl">
          Nest Foods UI Foundations
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-neutral-600 dark:text-neutral-300">
          A purple-gold corporate system built for a food manufacturer site: restrained surfaces,
          warm neutrals, high-contrast action buttons, and structured editorial spacing.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <div className="space-y-2">
            <p className="section-kicker">Color System</p>
            <h2 className="display-heading text-2xl text-neutral-900 dark:text-neutral-100">
              Packaging-led palette
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {colorTokens.map((token) => (
              <div key={token.name} className="space-y-3">
                <div className={`rounded-[1.4rem] px-4 py-10 shadow-[0_16px_34px_rgba(46,18,69,0.12)] ${token.className}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em]">{token.hex}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {token.name}
                  </p>
                  <p className="text-xs leading-6 text-neutral-600 dark:text-neutral-300">
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
            <h2 className="display-heading text-2xl text-neutral-900 dark:text-neutral-100">
              Header and footer treatment
            </h2>
          </div>
          <div className="brand-shell rounded-[1.75rem] border p-5">
            <div className="flex items-center justify-between gap-3 rounded-[1.1rem] border border-white/10 bg-white/6 px-4 py-3">
              <div>
                <p className="section-kicker text-[color:var(--brand-3)]">Nest Foods Ltd</p>
                <p className="text-sm text-white">Premium bread manufacturing.</p>
              </div>
              <Button size="sm">Distributor Portal</Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Products", "Traceability", "About", "Contact"].map((item) => (
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
            <h2 className="display-heading text-2xl text-neutral-900 dark:text-neutral-100">
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
            <h2 className="display-heading text-2xl text-neutral-900 dark:text-neutral-100">
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
          <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
            Gold is reserved for the most important actions. Purple fill is available for brand-led
            emphasis. Neutral buttons should support navigation and low-pressure actions.
          </p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-4">
          <div className="space-y-2">
            <p className="section-kicker">Form Controls</p>
            <h2 className="display-heading text-2xl text-neutral-900 dark:text-neutral-100">
              Input surfaces
            </h2>
          </div>
          <div className="space-y-3">
            <Input placeholder="Search products, ingredients, or certifications..." />
            <select className="field-control h-11 px-3 text-sm">
              <option>Distributor region</option>
              <option>South East</option>
              <option>South South</option>
            </select>
            <textarea
              className="field-control min-h-28 px-4 py-3 text-sm"
              placeholder="Share expected volume, route, and packaging requirements."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>Premium</Badge>
            <Badge className="text-[color:var(--brand-5)] dark:text-[color:var(--brand-4)]">
              Hygienic Production
            </Badge>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="space-y-2">
            <p className="section-kicker">Spacing & Layout</p>
            <h2 className="display-heading text-2xl text-neutral-900 dark:text-neutral-100">
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
                <p className="mt-2 display-heading text-2xl text-neutral-900 dark:text-neutral-100">
                  {token.value}
                </p>
                <p className="mt-2 text-xs leading-6 text-neutral-600 dark:text-neutral-300">
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
                  className="h-12 rounded-xl bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-1)_18%,transparent),color-mix(in_srgb,var(--brand-3)_20%,transparent))]"
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
            <h2 className="display-heading text-2xl text-neutral-900 dark:text-neutral-100">
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
            <h2 className="display-heading text-2xl text-neutral-900 dark:text-neutral-100">
              Reusable interaction layer
            </h2>
          </div>
          <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
            Use for confirmations, supporting detail, or operational disclosure without crowding the
            page shell.
          </p>
          <Button variant="brand" onClick={() => setOpen(true)}>
            Open Modal
          </Button>
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nest Foods UI System">
        <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
          The brand system is tuned for a manufacturer identity: structural purple, selective gold,
          warm neutrals, and direct action language.
        </p>
      </Modal>
    </section>
  );
}
