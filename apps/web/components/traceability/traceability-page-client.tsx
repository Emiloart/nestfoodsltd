"use client";

// Legacy public module retained temporarily while the website migrates to a
// corporate manufacturer scope. The public /traceability route now redirects
// to the homepage production-standards section and this component should not be
// reintroduced into the shell.

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type TraceabilityBatch } from "@/lib/traceability/types";

type LookupResponse = {
  batch: TraceabilityBatch;
};

type BatchesResponse = {
  batches: TraceabilityBatch[];
};

export function TraceabilityPageClient() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") ?? "";

  const [code, setCode] = useState(initialCode);
  const [batch, setBatch] = useState<TraceabilityBatch | null>(null);
  const [recentBatches, setRecentBatches] = useState<TraceabilityBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Enter a batch code or scan the QR value.");

  useEffect(() => {
    async function loadRecent() {
      const response = await fetch("/api/traceability/batches");
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as BatchesResponse;
      setRecentBatches(data.batches.slice(0, 6));
    }

    void loadRecent();
  }, []);

  useEffect(() => {
    if (!initialCode.trim()) {
      return;
    }
    void lookup(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function lookup(inputCode?: string) {
    const lookupCode = (inputCode ?? code).trim();
    if (!lookupCode) {
      return;
    }

    setLoading(true);
    setStatus("Looking up batch...");
    const response = await fetch(`/api/traceability/lookup?code=${encodeURIComponent(lookupCode)}`);
    if (!response.ok) {
      setBatch(null);
      setStatus("Batch not found. Check code and try again.");
      setLoading(false);
      return;
    }

    const data = (await response.json()) as LookupResponse;
    setBatch(data.batch);
    setStatus(`Loaded ${data.batch.batchCode}.`);
    setLoading(false);
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-3">
        <Badge>Quality Access</Badge>
        <h1 className="display-heading text-4xl text-neutral-900 sm:text-[3.15rem]">
          Quality & Traceability
        </h1>
        <p className="text-sm text-neutral-600">
          Verify bread batch sourcing, production, packaging, certification, and dispatch milestones
          from a single lookup.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="e.g. NFL-BREAD-260301-A"
            />
            <Button onClick={() => lookup()} disabled={loading || !code.trim()}>
              {loading ? "Looking up..." : "Lookup Batch"}
            </Button>
          </div>
          <p className="text-xs text-neutral-500">{status}</p>
        </Card>

        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Verification scope
          </p>
          <p className="text-sm text-neutral-700">
            Confirm supplier origin, line production details, QA sign-off, packaging timestamps, and
            active certifications before release or delivery.
          </p>
        </Card>
      </div>

      {batch ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Batch Details
            </p>
            <p className="text-sm font-semibold text-neutral-900">
              {batch.batchCode} · {batch.productName}
            </p>
            <p className="text-sm text-neutral-600">
              Status: <span className="font-semibold uppercase">{batch.status}</span>
            </p>
            <p className="text-sm text-neutral-600">
              Production: {batch.productionDate} · Expiry: {batch.expiryDate}
            </p>
            <p className="text-xs text-neutral-500">QR: {batch.qrCode}</p>
          </Card>

          <Card className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Source & Processing
            </p>
            <p className="text-sm text-neutral-700">
              Source: {batch.source.farmName}, {batch.source.region}, {batch.source.country}
            </p>
            <p className="text-sm text-neutral-700">
              Lot: {batch.source.lotReference} · Harvested {batch.source.harvestedAt ?? "N/A"}
            </p>
            <p className="text-sm text-neutral-700">
              Facility: {batch.processing.facilityName} ({batch.processing.lineName})
            </p>
            <p className="text-sm text-neutral-700">
              QA Lead: {batch.processing.qaLead} · Packaged {batch.processing.packagedAt}
            </p>
          </Card>

          <Card className="space-y-3 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Certifications
            </p>
            {batch.certifications.length === 0 ? (
              <p className="text-sm text-neutral-600">No certifications listed.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {batch.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-3"
                  >
                    <p className="text-sm font-semibold text-neutral-900">{cert.name}</p>
                    <p className="text-xs text-neutral-500">
                      {cert.issuer} · {cert.certificateCode}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Valid until: {cert.validUntil ?? "Not specified"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="space-y-3 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Journey Timeline
            </p>
            <div className="space-y-2">
              {batch.timeline.map((event) => (
                <div
                  key={event.id}
                  className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-neutral-900">{event.title}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                      {event.stage}
                    </p>
                  </div>
                  <p className="text-sm text-neutral-600">{event.description}</p>
                  <p className="text-xs text-neutral-500">
                    {event.location} · {event.startedAt}
                    {event.completedAt ? ` → ${event.completedAt}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}

      <Card className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Recent Batches
        </p>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {recentBatches.map((entry) => (
            <button
              type="button"
              key={entry.id}
              onClick={() => {
                setCode(entry.batchCode);
                void lookup(entry.batchCode);
              }}
              className="rounded-[1.2rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-3 text-left transition hover:-translate-y-0.5 hover:brightness-105"
            >
              <p className="text-sm font-semibold text-neutral-900">{entry.batchCode}</p>
              <p className="text-xs text-neutral-500">{entry.productName}</p>
            </button>
          ))}
        </div>
      </Card>
    </section>
  );
}
