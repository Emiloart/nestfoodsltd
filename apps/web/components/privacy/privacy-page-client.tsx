"use client";

import { useEffect, useState, type FormEvent } from "react";
import { readSavedConsentTime, rememberConsentTime } from "./consent-context";

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

const privacyPolicyText = [
  "We protect your privacy and are committed to protecting your personal information. Any data collected through our official website, email addresses, or business interactions is used solely for communication, service delivery, and improving customer experience.",
  "We do not sell or misuse customer data and implement appropriate safeguards to support data security.",
];

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
        const savedAt = readSavedConsentTime();
        setConsentStatus(
          savedAt
            ? `Saved on this browser ${new Date(savedAt).toLocaleString("en-NG")}`
            : "Unable to load consent settings.",
        );
        return;
      }

      const data = (await response.json()) as ConsentResponse;
      if (!data.consent) {
        const savedAt = readSavedConsentTime();
        setConsentStatus(
          savedAt
            ? `Saved on this browser ${new Date(savedAt).toLocaleString("en-NG")}`
            : "No optional consent saved yet.",
        );
        return;
      }

      rememberConsentTime(data.consent.consentedAt);
      setConsent({
        analytics: data.consent.categories.analytics,
        marketing: data.consent.categories.marketing,
        personalization: data.consent.categories.personalization,
      });
      setConsentStatus(
        `Last updated ${new Date(data.consent.consentedAt).toLocaleString("en-NG")}`,
      );
    }

    void loadConsent().catch(() =>
      setConsentStatus("Unable to load preferences. You can try saving them again."),
    );
  }, []);

  async function saveConsent() {
    setSavingConsent(true);
    setConsentStatus("Saving preferences...");

    try {
      const response = await fetch("/api/privacy/consent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          source: "privacy-page",
          locale: typeof navigator !== "undefined" ? navigator.language : undefined,
          categories: consent,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setConsentStatus(body?.error ?? "Failed to save consent.");
        return;
      }

      const data = (await response.json()) as ConsentResponse;
      rememberConsentTime(data.consent?.consentedAt ?? new Date().toISOString());
      setConsentStatus(
        data.consent
          ? `Saved ${new Date(data.consent.consentedAt).toLocaleString("en-NG")}`
          : "Saved.",
      );
    } catch {
      setConsentStatus("Unable to save consent right now.");
    } finally {
      setSavingConsent(false);
    }
  }

  async function submitDataRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRequest) return;
    setSubmittingRequest(true);
    setRequestStatus("Submitting your request…");
    try {
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
        throw new Error(body?.error ?? "Unable to submit your request. Please try again.");
      }
      const data = (await response.json()) as DataRequestResponse;
      setRequestStatus(
        `Request ${data.dataRequest.id} received. Status: ${data.dataRequest.status}. Keep this reference for follow-up.`,
      );
      setMessage("");
    } catch (error) {
      setRequestStatus(
        error instanceof TypeError || error instanceof SyntaxError
          ? "Your request could not be sent. Please check your connection and try again, or contact the company."
          : error instanceof Error
            ? error.message
            : "Unable to submit your request. Please try again.",
      );
    } finally {
      setSubmittingRequest(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-16 md:px-6">
      <div className="space-y-3">
        <Badge>NDPR Privacy Center</Badge>
        <h1 className="display-heading text-4xl text-neutral-900 sm:text-[3.15rem]">
          Privacy & Data Controls
        </h1>
        <p className="text-sm text-neutral-600">
          Manage optional consent preferences and submit NDPR data export or deletion requests.
        </p>
      </div>

      <Card className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
          Privacy Policy
        </p>
        {privacyPolicyText.map((paragraph) => (
          <p key={paragraph} className="pretty-text text-sm leading-7 text-neutral-700">
            {paragraph}
          </p>
        ))}
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
            Consent Preferences
          </p>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked
              disabled
              className="h-4 w-4 rounded border-[color:var(--border-strong)] accent-[color:var(--brand-1)]"
            />
            Necessary cookies (always enabled)
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={consent.analytics}
              onChange={(event) =>
                setConsent((current) => ({ ...current, analytics: event.target.checked }))
              }
              className="h-4 w-4 rounded border-[color:var(--border-strong)] accent-[color:var(--brand-1)]"
            />
            Analytics cookies
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={consent.personalization}
              onChange={(event) =>
                setConsent((current) => ({ ...current, personalization: event.target.checked }))
              }
              className="h-4 w-4 rounded border-[color:var(--border-strong)] accent-[color:var(--brand-1)]"
            />
            Personalization cookies
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={consent.marketing}
              onChange={(event) =>
                setConsent((current) => ({ ...current, marketing: event.target.checked }))
              }
              className="h-4 w-4 rounded border-[color:var(--border-strong)] accent-[color:var(--brand-1)]"
            />
            Marketing cookies
          </label>
          <Button onClick={saveConsent} disabled={savingConsent}>
            {savingConsent ? "Saving..." : "Save Consent Preferences"}
          </Button>
          <p className="text-xs text-neutral-500">{consentStatus}</p>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Data request</h2>
          <form className="space-y-4" onSubmit={submitDataRequest}>
            <Input
              type="email"
              name="email"
              label="Email address (required)"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              name="fullName"
              label="Full name (optional)"
              autoComplete="name"
              maxLength={160}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
            <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
              <span>Request type</span>
              <select
                value={requestType}
                onChange={(event) => setRequestType(event.target.value as "export" | "delete")}
                className="field-control h-11 px-3 text-base"
              >
                <option value="export">Export my data</option>
                <option value="delete">Delete my data</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-neutral-800">
              <span>Additional context (optional)</span>
              <textarea
                value={message}
                maxLength={1200}
                onChange={(event) => setMessage(event.target.value)}
                className="field-control min-h-24 px-3 py-2 text-base"
              />
            </label>
            <Button type="submit" disabled={submittingRequest}>
              {submittingRequest ? "Submitting…" : "Submit data request"}
            </Button>
            <p role="status" className="text-sm text-neutral-700">
              {requestStatus}
            </p>
          </form>
        </Card>
      </div>
    </section>
  );
}
