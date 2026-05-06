"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";
import { WHATSAPP_CONTACTS } from "@/lib/whatsapp";
import { WHATSAPP_LINKS } from "@/lib/company/contact";

export function FloatingWhatsAppCta() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 z-40 md:bottom-6">
      <div
        className={cn(
          "mb-3 w-[min(19rem,calc(100vw-2rem))] rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-3 shadow-[0_18px_38px_rgba(46,18,69,0.18)] transition",
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          WhatsApp
        </p>
        <p className="mt-1 text-sm text-neutral-600">Choose the best contact route.</p>
        <div className="mt-3 grid gap-2">
          {(["general", "sales", "hr"] as const).map((key) => (
            <a
              key={key}
              href={WHATSAPP_LINKS[key]}
              target="_blank"
              rel="noreferrer"
              className="rounded-[1rem] border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:border-[color:var(--border-strong)] hover:text-[color:var(--brand-1)]"
            >
              {WHATSAPP_CONTACTS[key].label}
            </a>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-14 items-center gap-3 rounded-full border border-white/50 bg-[#25d366] px-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_16px_34px_rgba(37,211,102,0.28)] transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/18 text-lg">W</span>
        <span className="hidden sm:inline">Chat</span>
      </button>
    </div>
  );
}
