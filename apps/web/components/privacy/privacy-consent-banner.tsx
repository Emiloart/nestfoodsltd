"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ConsentResponse = {
  consent: {
    categories: {
      necessary: true;
      analytics: boolean;
      marketing: boolean;
      personalization: boolean;
    };
    consentedAt: string;
  } | null;
};

export function PrivacyConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadConsent() {
      const response = await fetch("/api/privacy/consent", { cache: "no-store" });
      if (!response.ok) {
        setVisible(true);
        return;
      }
      const data = (await response.json()) as ConsentResponse;
      setVisible(!data.consent);
    }

    void loadConsent();
  }, []);

  async function submitConsent(input: {
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
  }) {
    setSaving(true);
    setStatus("Saving preferences...");

    const response = await fetch("/api/privacy/consent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: "banner",
        categories: input,
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Unable to save consent.");
      setSaving(false);
      return;
    }

    setStatus("Consent saved.");
    setSaving(false);
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 mx-auto w-full max-w-5xl px-4">
      <Card className="space-y-3 border-neutral-300 shadow-xl dark:border-neutral-700">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Privacy Preferences
        </p>
        <p className="text-xs text-neutral-600 dark:text-neutral-300">
          We use essential cookies for platform operation and optional cookies for analytics,
          personalization, and marketing. You can update this anytime on the privacy page.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() =>
              submitConsent({ analytics: true, marketing: true, personalization: true })
            }
            disabled={saving}
          >
            Accept All
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              submitConsent({ analytics: false, marketing: false, personalization: false })
            }
            disabled={saving}
          >
            Essential Only
          </Button>
        </div>
        {status ? <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p> : null}
      </Card>
    </div>
  );
}
