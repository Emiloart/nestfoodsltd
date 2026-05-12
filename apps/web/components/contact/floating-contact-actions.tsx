"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { WhatsAppIcon } from "@/components/social-icons";
import { cn } from "@/lib/cn";
import { CONTACT_CHANNELS, WHATSAPP_LINKS } from "@/lib/company/contact";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="M4.75 6.75h14.5v10.5H4.75V6.75Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m5.25 7.25 6.75 5 6.75-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="M8.1 5.25 9.6 8.7l-1.75 1.45c1.1 2.28 2.8 3.98 5.05 5.05l1.45-1.75 3.45 1.5-.45 3.05c-.1.65-.66 1.12-1.31 1.12C9.7 19.12 4.88 14.3 4.88 7.96c0-.65.47-1.21 1.12-1.31l2.1-.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="M5.25 6.75A3.25 3.25 0 0 1 8.5 3.5h7A3.25 3.25 0 0 1 18.75 6.75v4.5A3.25 3.25 0 0 1 15.5 14.5h-3.3l-3.58 3.08c-.55.47-1.37.08-1.37-.64V14.4A3.25 3.25 0 0 1 5.25 11.25v-4.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 8.5h6M9 11h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const emailChannel =
  CONTACT_CHANNELS.find((channel) => channel.label === "Official email") ?? CONTACT_CHANNELS[3];
const phoneChannel =
  CONTACT_CHANNELS.find((channel) => channel.label === "Primary phone") ?? CONTACT_CHANNELS[0];

export function FloatingContactActions() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const shouldCompact = window.scrollY > 24;
      setCompact(shouldCompact);
      if (shouldCompact) {
        setOpen(false);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const actions = [
    {
      label: "Send Email",
      href: emailChannel.href,
      value: emailChannel.value,
      icon: <MailIcon />,
    },
    {
      label: "WhatsApp",
      href: WHATSAPP_LINKS.general,
      value: "Chat with De-Nest Bread",
      icon: <WhatsAppIcon />,
      external: true,
    },
    {
      label: "Call",
      href: phoneChannel.href,
      value: phoneChannel.value,
      icon: <PhoneIcon />,
    },
  ];

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(92vw,20rem)] flex-col items-end gap-3 md:bottom-6">
      <div
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
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--bg-accent-brand)] text-[color:var(--brand-1)]">
                {action.icon}
              </span>
              <span>
                <span className="block">{action.label}</span>
                <span className="block text-xs font-medium text-neutral-500">{action.value}</span>
              </span>
            </a>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close contact options" : "Open contact options"}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "contact-pulse pointer-events-auto inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[color:var(--brand-2)] bg-[color:var(--brand-3)] text-xs font-black uppercase tracking-[0.14em] text-[color:var(--brand-2)] shadow-[0_16px_34px_rgba(46,18,69,0.2)] transition hover:scale-[1.02] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]",
          compact && !open ? "w-12 px-0" : "px-4",
        )}
      >
        {open ? <CloseIcon /> : compact ? <ChatIcon /> : <PhoneIcon />}
        {compact && !open ? null : "Contact"}
      </button>
    </div>
  );
}
