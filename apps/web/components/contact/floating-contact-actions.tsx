"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useConsentVisibility } from "@/components/privacy/consent-context";
import { cn } from "@/lib/cn";
import { type CompanyContactChannel, type CompanyWhatsAppContact } from "@/lib/company/types";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type FloatingContactActionsProps = {
  contactChannels: CompanyContactChannel[];
  whatsappContacts: CompanyWhatsAppContact[];
};

export function FloatingContactActions({
  contactChannels,
  whatsappContacts,
}: FloatingContactActionsProps) {
  const pathname = usePathname();
  const consent = useConsentVisibility();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        document.getElementById("floating-contact-toggle")?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  if (
    pathname.startsWith("/admin") ||
    pathname === "/contact" ||
    pathname === "/careers" ||
    !consent.ready ||
    consent.visible
  ) {
    return null;
  }

  const emailChannel =
    contactChannels.find((channel) => channel.href.startsWith("mailto:")) ?? contactChannels[0];
  const phoneChannel =
    contactChannels.find((channel) => channel.href.startsWith("tel:")) ?? contactChannels[0];
  const generalWhatsApp =
    whatsappContacts.find((contact) => contact.id === "general") ?? whatsappContacts[0];
  const whatsappHref = generalWhatsApp
    ? buildWhatsAppUrl(generalWhatsApp.phone, generalWhatsApp.message)
    : "/contact";

  const actions = [
    {
      label: "Send Email",
      href: emailChannel?.href ?? "mailto:info@nestfoodsltd.com",
      value: emailChannel?.value ?? "info@nestfoodsltd.com",
    },
    {
      label: "WhatsApp",
      href: whatsappHref,
      value: "Chat with De-Nest Bread",
      external: true,
    },
    {
      label: "Call",
      href: phoneChannel?.href ?? "tel:+2347066898953",
      value: phoneChannel?.value ?? "07066898953",
    },
  ];

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(92vw,20rem)] flex-col items-end gap-3 md:bottom-6">
      <div
        id="floating-contact-options"
        hidden={!open}
        className={cn(
          "pointer-events-auto w-full rounded-[1.3rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-3 shadow-[0_18px_38px_rgba(46,18,69,0.16)] transition duration-200",
          open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 pointer-events-none",
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Contact
        </p>
        <div className="mt-3 grid gap-2">
          {actions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noreferrer" : undefined}
              className="flex items-center gap-3 rounded-[1rem] border border-[color:var(--border)] bg-white px-3 py-2.5 text-left text-sm font-semibold text-neutral-900 transition hover:border-[color:var(--brand-1)] hover:text-[color:var(--brand-1)]"
            >
              <span>
                <span className="block">{action.label}</span>
                <span className="block text-xs font-medium text-neutral-500">{action.value}</span>
              </span>
            </a>
          ))}
        </div>
      </div>

      <button
        id="floating-contact-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="floating-contact-options"
        aria-label={open ? "Close contact options" : "Open contact options"}
        onClick={() => setOpen((current) => !current)}
        className="pointer-events-auto inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--brand-2)] bg-[color:var(--brand-3)] px-5 py-3 text-sm font-semibold text-[color:var(--brand-2)] shadow-md transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]"
      >
        {open ? "Close" : "Contact"}
      </button>
    </div>
  );
}
