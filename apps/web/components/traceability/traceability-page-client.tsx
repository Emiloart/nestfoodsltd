"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [status, setStatus] = useState("Enter a batch code or scan QR.");

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
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Batch Traceability
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Enter batch code (or QR value) to see sourcing, processing, certifications, and logistics
          timeline.
        </p>
      </div>

      <Card className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="e.g. NFL-JOLLOF-260201-A"
          />
          <Button onClick={() => lookup()} disabled={loading || !code.trim()}>
            {loading ? "Looking up..." : "Lookup Batch"}
          </Button>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
      </Card>

      {batch ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Batch Details
            </p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {batch.batchCode} · {batch.productName}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Status: <span className="font-semibold uppercase">{batch.status}</span>
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Production: {batch.productionDate} · Expiry: {batch.expiryDate}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">QR: {batch.qrCode}</p>
          </Card>

          <Card className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Source & Processing
            </p>
            <p className="text-sm text-neutral-700 dark:text-neutral-200">
              Source: {batch.source.farmName}, {batch.source.region}, {batch.source.country}
            </p>
            <p className="text-sm text-neutral-700 dark:text-neutral-200">
              Lot: {batch.source.lotReference} · Harvested {batch.source.harvestedAt ?? "N/A"}
            </p>
            <p className="text-sm text-neutral-700 dark:text-neutral-200">
              Facility: {batch.processing.facilityName} ({batch.processing.lineName})
            </p>
            <p className="text-sm text-neutral-700 dark:text-neutral-200">
              QA Lead: {batch.processing.qaLead} · Packaged {batch.processing.packagedAt}
            </p>
          </Card>

          <Card className="space-y-3 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Certifications
            </p>
            {batch.certifications.length === 0 ? (
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                No certifications listed.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {batch.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
                  >
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {cert.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {cert.issuer} · {cert.certificateCode}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
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
                  className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {event.title}
                    </p>
                    <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                      {event.stage}
                    </p>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    {event.description}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
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
              className="rounded-xl border border-neutral-200 p-3 text-left transition hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900"
            >
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {entry.batchCode}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{entry.productName}</p>
            </button>
          ))}
        </div>
      </Card>
    </section>
  );
}
