"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

type DataRequestResponse = {
  dataRequest: {
    id: string;
    status: string;
    type: "export" | "delete";
    createdAt: string;
  };
};

export function PrivacyPageClient() {
  const [consent, setConsent] = useState({
    analytics: false,
    marketing: false,
    personalization: false,
  });
  const [consentStatus, setConsentStatus] = useState("Loading consent settings...");
  const [savingConsent, setSavingConsent] = useState(false);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [requestType, setRequestType] = useState<"export" | "delete">("export");
  const [message, setMessage] = useState("");
  const [requestStatus, setRequestStatus] = useState("Submit an NDPR data request.");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    async function loadConsent() {
      const response = await fetch("/api/privacy/consent", { cache: "no-store" });
      if (!response.ok) {
        setConsentStatus("Unable to load consent settings.");
        return;
      }

      const data = (await response.json()) as ConsentResponse;
      if (!data.consent) {
        setConsentStatus("No optional consent saved yet.");
        return;
      }

      setConsent({
        analytics: data.consent.categories.analytics,
        marketing: data.consent.categories.marketing,
        personalization: data.consent.categories.personalization,
      });
      setConsentStatus(
        `Last updated ${new Date(data.consent.consentedAt).toLocaleString("en-NG")}`,
      );
    }

    void loadConsent();
  }, []);

  async function saveConsent() {
    setSavingConsent(true);
    const response = await fetch("/api/privacy/consent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: "privacy-page",
        categories: consent,
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setConsentStatus(body?.error ?? "Failed to save consent.");
      setSavingConsent(false);
      return;
    }

    const data = (await response.json()) as ConsentResponse;
    setConsentStatus(
      data.consent
        ? `Saved ${new Date(data.consent.consentedAt).toLocaleString("en-NG")}`
        : "Saved.",
    );
    setSavingConsent(false);
  }

  async function submitDataRequest() {
    if (!email.trim()) {
      setRequestStatus("Email is required.");
      return;
    }

    setSubmittingRequest(true);
    const response = await fetch("/api/privacy/data-requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        fullName: fullName || undefined,
        type: requestType,
        message: message || undefined,
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setRequestStatus(body?.error ?? "Failed to submit request.");
      setSubmittingRequest(false);
      return;
    }

    const data = (await response.json()) as DataRequestResponse;
    setRequestStatus(
      `Request ${data.dataRequest.id} submitted with status ${data.dataRequest.status}.`,
    );
    setMessage("");
    setSubmittingRequest(false);
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 md:px-6">
      <div className="space-y-3">
        <Badge>NDPR Privacy Center</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Privacy & Data Controls
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Manage optional consent preferences and submit NDPR data export or deletion requests.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
            Consent Preferences
          </p>
          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200">
            <input
              type="checkbox"
              checked
              disabled
              className="h-4 w-4 rounded border-neutral-300"
            />
            Necessary cookies (always enabled)
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200">
            <input
              type="checkbox"
              checked={consent.analytics}
              onChange={(event) =>
                setConsent((current) => ({ ...current, analytics: event.target.checked }))
              }
              className="h-4 w-4 rounded border-neutral-300"
            />
            Analytics cookies
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200">
            <input
              type="checkbox"
              checked={consent.personalization}
              onChange={(event) =>
                setConsent((current) => ({ ...current, personalization: event.target.checked }))
              }
              className="h-4 w-4 rounded border-neutral-300"
            />
            Personalization cookies
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200">
            <input
              type="checkbox"
              checked={consent.marketing}
              onChange={(event) =>
                setConsent((current) => ({ ...current, marketing: event.target.checked }))
              }
              className="h-4 w-4 rounded border-neutral-300"
            />
            Marketing cookies
          </label>
          <Button onClick={saveConsent} disabled={savingConsent}>
            {savingConsent ? "Saving..." : "Save Consent Preferences"}
          </Button>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{consentStatus}</p>
        </Card>

        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
            Data Subject Request
          </p>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
          />
          <Input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Full name (optional)"
          />
          <select
            value={requestType}
            onChange={(event) => setRequestType(event.target.value as "export" | "delete")}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          >
            <option value="export">Export my data</option>
            <option value="delete">Delete my data</option>
          </select>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Additional request context (optional)"
            className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <Button onClick={submitDataRequest} disabled={submittingRequest || !email.trim()}>
            {submittingRequest ? "Submitting..." : "Submit Data Request"}
          </Button>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{requestStatus}</p>
        </Card>
      </div>
    </section>
  );
}
