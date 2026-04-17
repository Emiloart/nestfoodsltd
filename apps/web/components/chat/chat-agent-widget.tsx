"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type ChatIntent, type ChatQuickAction, type ChatSuggestedLink } from "@/lib/chat/types";

type WidgetMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type AskChatResponse = {
  conversationId: string;
  sessionId: string;
  assistantMessageId: string;
  answer: string;
  intent: ChatIntent;
  confidence: number;
  quickActions: ChatQuickAction[];
  suggestedLinks: ChatSuggestedLink[];
  handoffSuggested: boolean;
  handoffReason?: string;
  createdAt: string;
};

type LeadCreateResponse = {
  conversationId: string;
  sessionId: string;
  lead: {
    id: string;
  };
};

const sessionStorageKey = "nestfoodsltd_chat_session_id";
const conversationStorageKey = "nestfoodsltd_chat_conversation_id";

const initialQuickActions: ChatQuickAction[] = [
  { label: "Compare breads", prompt: "Compare your bread options for me." },
  { label: "About Nest Foods", prompt: "Tell me about Nest Foods." },
  { label: "Careers", prompt: "How can I learn about careers at Nest Foods?" },
  { label: "Contact Nest Foods", prompt: "Help me contact the Nest Foods team." },
];

const initialLinks: ChatSuggestedLink[] = [
  { label: "Products", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function buildSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `chat-session-${crypto.randomUUID()}`;
  }
  return `chat-session-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
}

function createLocalMessage(input: Pick<WidgetMessage, "role" | "content">): WidgetMessage {
  return {
    id: `local-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`,
    role: input.role,
    content: input.content,
    createdAt: new Date().toISOString(),
  };
}

function AssistantIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="M7.5 9.5a4.5 4.5 0 0 1 9 0v2.25A2.75 2.75 0 0 1 13.75 14.5h-3.5A2.75 2.75 0 0 1 7.5 11.75V9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5.75 11.75v.5a6.25 6.25 0 0 0 12.5 0v-.5M12 6.5V3.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LaunchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="M12 3.5 4.5 7.25v5.5C4.5 17.5 7.8 20.6 12 21.5c4.2-.9 7.5-4 7.5-8.75v-5.5L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="m9.5 12 1.7 1.7 3.3-3.3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function ChatAgentWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<WidgetMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "I’m Nest Agent. Ask me about products, Nest Foods, careers, or how to reach the team.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [quickActions, setQuickActions] = useState<ChatQuickAction[]>(initialQuickActions);
  const [suggestedLinks, setSuggestedLinks] = useState<ChatSuggestedLink[]>(initialLinks);
  const [lastIntent, setLastIntent] = useState<ChatIntent>("unknown");
  const [handoffSuggested, setHandoffSuggested] = useState(false);
  const [handoffReason, setHandoffReason] = useState("");
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadMessage, setLeadMessage] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadStatus, setLeadStatus] = useState("");
  const conversationIdRef = useRef("");
  const sessionIdRef = useRef("");
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const storedSessionId = window.localStorage.getItem(sessionStorageKey);
    const storedConversationId = window.localStorage.getItem(conversationStorageKey);
    const nextSessionId = storedSessionId || buildSessionId();

    sessionIdRef.current = nextSessionId;
    conversationIdRef.current = storedConversationId ?? "";
    if (!storedSessionId) {
      window.localStorage.setItem(sessionStorageKey, nextSessionId);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const viewport = messagesViewportRef.current;
    if (!viewport) {
      return;
    }
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
  }, [open, messages, leadFormOpen, handoffSuggested]);

  const canSend = useMemo(() => inputValue.trim().length > 0 && !sending, [inputValue, sending]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  async function sendMessage(rawMessage: string) {
    const message = rawMessage.trim();
    if (!message || sending) {
      return;
    }

    setMessages((current) => [...current, createLocalMessage({ role: "user", content: message })]);
    setInputValue("");
    setSending(true);
    setLeadStatus("");

    const response = await fetch("/api/chat/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message,
        conversationId: conversationIdRef.current || undefined,
        sessionId: sessionIdRef.current || undefined,
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessages((current) => [
        ...current,
        createLocalMessage({
          role: "assistant",
          content: body?.error ?? "I could not process that request right now.",
        }),
      ]);
      setSending(false);
      return;
    }

    const data = (await response.json()) as AskChatResponse;
    conversationIdRef.current = data.conversationId;
    sessionIdRef.current = data.sessionId;
    window.localStorage.setItem(conversationStorageKey, data.conversationId);
    window.localStorage.setItem(sessionStorageKey, data.sessionId);

    setMessages((current) => [
      ...current,
      {
        id: data.assistantMessageId,
        role: "assistant",
        content: data.answer,
        createdAt: data.createdAt,
      },
    ]);
    setQuickActions(data.quickActions.length > 0 ? data.quickActions : initialQuickActions);
    setSuggestedLinks(data.suggestedLinks.length > 0 ? data.suggestedLinks : initialLinks);
    setLastIntent(data.intent);
    setHandoffSuggested(data.handoffSuggested);
    setHandoffReason(data.handoffReason ?? "");

    if (data.handoffSuggested) {
      setLeadMessage((current) => current || message);
    }

    setSending(false);
  }

  async function onLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (leadSubmitting) {
      return;
    }

    setLeadSubmitting(true);
    setLeadStatus("Submitting support request...");

    const response = await fetch("/api/chat/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        conversationId: conversationIdRef.current || undefined,
        sessionId: sessionIdRef.current || undefined,
        name: leadName || undefined,
        email: leadEmail,
        phone: leadPhone || undefined,
        message: leadMessage,
        sourceIntent: lastIntent,
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setLeadStatus(body?.error ?? "Failed to submit support request.");
      setLeadSubmitting(false);
      return;
    }

    const data = (await response.json()) as LeadCreateResponse;
    conversationIdRef.current = data.conversationId;
    sessionIdRef.current = data.sessionId;
    window.localStorage.setItem(conversationStorageKey, data.conversationId);
    window.localStorage.setItem(sessionStorageKey, data.sessionId);

    setLeadStatus("Support request submitted. Our team will contact you.");
    setLeadSubmitting(false);
    setLeadFormOpen(false);
  }

  function onWidgetToggle() {
    setOpen((current) => !current);
  }

  function resetConversation() {
    conversationIdRef.current = "";
    window.localStorage.removeItem(conversationStorageKey);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "I’m Nest Agent. Ask me about products, Nest Foods, careers, or how to reach the team.",
        createdAt: new Date().toISOString(),
      },
    ]);
    setQuickActions(initialQuickActions);
    setSuggestedLinks(initialLinks);
    setLastIntent("unknown");
    setHandoffSuggested(false);
    setHandoffReason("");
    setLeadFormOpen(false);
    setLeadName("");
    setLeadEmail("");
    setLeadPhone("");
    setLeadMessage("");
    setLeadSubmitting(false);
    setLeadStatus("");
    setInputValue("");
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-3 z-[70] flex w-[min(92vw,360px)] flex-col items-end gap-3 md:bottom-8 md:right-4 md:w-[min(95vw,380px)]">
      {open ? (
        <Card className="pointer-events-auto w-full overflow-hidden p-0">
          <div className="shell-surface flex items-center justify-between border-b px-4 py-3">
            <div className="space-y-1">
              <Badge>Nest Agent</Badge>
              <p className="hidden text-xs text-neutral-600 md:block">
                Product, company, and enquiry assistant
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetConversation}
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] px-3 py-1 text-[11px] font-medium text-neutral-600 transition hover:bg-white/70 hover:text-neutral-900"
              >
                New Chat
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border)] text-neutral-600 transition hover:bg-white/70 hover:text-neutral-900"
                aria-label="Close chat"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          <div
            ref={messagesViewportRef}
            className="max-h-[48vh] min-h-52 space-y-3 overflow-y-auto px-4 py-4 md:max-h-[52vh] md:min-h-56"
          >
            {messages.map((entry) => (
              <div key={entry.id} className={entry.role === "user" ? "ml-12" : "mr-12"}>
                <div
                  className={
                    entry.role === "user"
                      ? "rounded-2xl rounded-br-md bg-[color:var(--brand-1)] px-3 py-2 text-sm text-white"
                      : "rounded-2xl rounded-bl-md border border-[color:var(--border)] bg-[color:var(--surface-overlay)] px-3 py-2 text-sm text-neutral-700"
                  }
                >
                  {entry.content}
                </div>
              </div>
            ))}
            {sending ? (
              <div className="mr-12 rounded-2xl rounded-bl-md border border-[color:var(--border)] bg-[color:var(--surface-overlay)] px-3 py-2 text-sm text-neutral-600">
                Thinking...
              </div>
            ) : null}
          </div>

          {suggestedLinks.length > 0 ? (
            <div className="border-t border-[color:var(--border)] px-4 py-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Quick Links
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedLinks.map((link) => (
                  <Link
                    key={`${link.label}-${link.href}`}
                    href={link.href}
                    className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-overlay)] px-3 py-1 text-xs font-medium text-neutral-700 transition hover:brightness-105"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className="border-t border-[color:var(--border)] px-4 py-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Suggested Prompts
            </p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  type="button"
                  key={action.prompt}
                  onClick={() => void sendMessage(action.prompt)}
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-overlay)] px-3 py-1 text-xs text-neutral-700 transition hover:brightness-105"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {handoffSuggested ? (
            <div className="border-t border-[color:var(--border)] px-4 py-3">
              <p className="text-xs text-neutral-600">
                {handoffReason || "Need a human follow-up? We can escalate this."}
              </p>
              <button
                type="button"
                onClick={() => setLeadFormOpen((current) => !current)}
                className="mt-2 rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-medium text-neutral-700 transition hover:brightness-105"
              >
                {leadFormOpen ? "Hide Support Form" : "Request Human Support"}
              </button>

              {leadFormOpen ? (
                <form className="mt-3 space-y-2" onSubmit={(event) => void onLeadSubmit(event)}>
                  <Input
                    value={leadName}
                    onChange={(event) => setLeadName(event.target.value)}
                    placeholder="Full name (optional)"
                  />
                  <Input
                    value={leadEmail}
                    onChange={(event) => setLeadEmail(event.target.value)}
                    placeholder="Email address"
                    type="email"
                    required
                  />
                  <Input
                    value={leadPhone}
                    onChange={(event) => setLeadPhone(event.target.value)}
                    placeholder="Phone (optional)"
                  />
                  <textarea
                    value={leadMessage}
                    onChange={(event) => setLeadMessage(event.target.value)}
                    className="min-h-20 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-overlay)] px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
                    placeholder="How can we help you?"
                    required
                  />
                  <Button size="sm" type="submit" disabled={leadSubmitting}>
                    {leadSubmitting ? "Submitting..." : "Submit Support Request"}
                  </Button>
                  {leadStatus ? <p className="text-xs text-neutral-500">{leadStatus}</p> : null}
                </form>
              ) : null}
            </div>
          ) : null}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(inputValue);
            }}
            className="border-t border-[color:var(--border)] px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <Input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Ask about products, Nest Foods, careers, or how to reach the team..."
                disabled={sending}
              />
              <Button size="sm" type="submit" disabled={!canSend}>
                Send
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Button
        onClick={onWidgetToggle}
        className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full px-0 md:h-auto md:w-auto md:gap-2 md:px-4"
        aria-label={open ? "Close Nest chat agent" : "Open Nest chat agent"}
      >
        {open ? <CloseIcon /> : <LaunchIcon />}
        <span className="hidden md:inline">{open ? "Close Agent" : "Chat with Nest Agent"}</span>
      </Button>
      {!open ? (
        <span className="pointer-events-none mr-1 inline-flex items-center gap-1 text-[11px] text-neutral-500">
          <AssistantIcon />
          <span className="hidden md:inline">Products + enquiries assistant</span>
        </span>
      ) : null}
    </div>
  );
}
