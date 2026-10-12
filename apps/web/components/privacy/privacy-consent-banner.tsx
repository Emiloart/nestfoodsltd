"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { rememberConsentTime, useConsentVisibility } from "./consent-context";

export function PrivacyConsentBanner() {
  const { visible } = useConsentVisibility();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  async function submitConsent(optional: boolean) {
    if (saving) return;
    setSaving(true);
    setStatus("Saving preferences…");
    try {
      const response = await fetch("/api/privacy/consent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          source: "banner",
          locale: navigator.language,
          categories: { analytics: optional, marketing: optional, personalization: optional },
        }),
      });
      const data = (await response.json()) as { error?: string; consent?: { consentedAt: string } };
      if (!response.ok)
        throw new Error(data.error ?? "Unable to save preferences. Please try again.");
      rememberConsentTime(data.consent?.consentedAt ?? new Date().toISOString());
      setStatus("");
    } catch (error) {
      setStatus(
        error instanceof TypeError || error instanceof SyntaxError
          ? "Please check your connection and try saving your preferences again."
          : error instanceof Error
            ? error.message
            : "Unable to save preferences. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }
  if (!visible) return null;
  return (
    <aside
      aria-label="Privacy preferences"
      className="fixed inset-x-0 bottom-[calc(1rem_+_env(safe-area-inset-bottom))] z-[80] mx-auto w-full max-w-5xl px-4"
    >
      <Card className="space-y-3 border-neutral-300 shadow-xl">
        <p className="text-base font-semibold text-neutral-900">Privacy preferences</p>
        <p className="text-sm leading-6 text-neutral-700">
          Essential cookies keep this website working. You can choose whether to allow optional
          analytics, personalization and marketing cookies.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={saving} onClick={() => void submitConsent(true)}>
            Accept all
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={saving}
            onClick={() => void submitConsent(false)}
          >
            Essential only
          </Button>
          <Link
            href="/privacy"
            className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-[color:var(--brand-1)] underline underline-offset-4"
          >
            Manage preferences
          </Link>
        </div>
        {status ? (
          <p role="status" className="text-sm text-neutral-700">
            {status}
          </p>
        ) : null}
      </Card>
    </aside>
  );
}
