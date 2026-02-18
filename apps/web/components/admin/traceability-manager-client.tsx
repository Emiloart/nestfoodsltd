"use client";

import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type TraceabilityBatch } from "@/lib/traceability/types";

type AdminBatchesResponse = {
  role: string;
  batches: TraceabilityBatch[];
};

type BatchResponse = {
  role: string;
  batch: TraceabilityBatch;
};

const emptyForm = {
  batchCode: "",
  qrCode: "",
  productSlug: "",
  productName: "",
  variantId: "",
  status: "active" as "active" | "recalled" | "sold_out",
  productionDate: "",
  expiryDate: "",
  sourceFarmName: "",
  sourceRegion: "",
  sourceCountry: "Nigeria",
  sourceLotReference: "",
  sourceHarvestedAt: "",
  facilityName: "",
  lineName: "",
  packagedAt: "",
  qaLead: "",
  certificationsText: "",
  timelineText: "",
  adminNotes: "",
};

function parseCertifications(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, issuer, certificateCode, validUntil] = line
        .split("|")
        .map((part) => part?.trim() || "");
      return {
        name: name || "Certification",
        issuer: issuer || "Unknown issuer",
        certificateCode: certificateCode || "N/A",
        validUntil: validUntil || undefined,
      };
    });
}

function parseTimeline(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [stage, title, description, location, startedAt, completedAt] = line
        .split("|")
        .map((part) => part?.trim() || "");
      return {
        stage:
          stage === "sourcing" ||
          stage === "processing" ||
          stage === "quality_check" ||
          stage === "distribution" ||
          stage === "delivery"
            ? stage
            : "processing",
        title: title || "Timeline event",
        description: description || "No description provided.",
        location: location || "Unknown location",
        startedAt: startedAt || new Date().toISOString(),
        completedAt: completedAt || undefined,
      };
    });
}

function toForm(batch: TraceabilityBatch) {
  return {
    batchCode: batch.batchCode,
    qrCode: batch.qrCode,
    productSlug: batch.productSlug,
    productName: batch.productName,
    variantId: batch.variantId ?? "",
    status: batch.status,
    productionDate: batch.productionDate,
    expiryDate: batch.expiryDate,
    sourceFarmName: batch.source.farmName,
    sourceRegion: batch.source.region,
    sourceCountry: batch.source.country,
    sourceLotReference: batch.source.lotReference,
    sourceHarvestedAt: batch.source.harvestedAt ?? "",
    facilityName: batch.processing.facilityName,
    lineName: batch.processing.lineName,
    packagedAt: batch.processing.packagedAt,
    qaLead: batch.processing.qaLead,
    certificationsText: batch.certifications
      .map((entry) =>
        [entry.name, entry.issuer, entry.certificateCode, entry.validUntil ?? ""].join(" | "),
      )
      .join("\n"),
    timelineText: batch.timeline
      .map((entry) =>
        [
          entry.stage,
          entry.title,
          entry.description,
          entry.location,
          entry.startedAt,
          entry.completedAt ?? "",
        ].join(" | "),
      )
      .join("\n"),
    adminNotes: batch.adminNotes ?? "",
  };
}

export function TraceabilityManagerClient() {
  const [role, setRole] = useState("Unknown");
  const [batches, setBatches] = useState<TraceabilityBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [form, setForm] = useState(emptyForm);
  const [bulkImportText, setBulkImportText] = useState("");
  const [status, setStatus] = useState("Loading batches...");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/admin/traceability/batches", { cache: "no-store" });
      if (!response.ok) {
        setStatus("Failed to load traceability batches.");
        return;
      }
      const data = (await response.json()) as AdminBatchesResponse;
      setRole(data.role);
      setBatches(data.batches);
      if (data.batches[0]) {
        setSelectedBatchId(data.batches[0].id);
        setForm(toForm(data.batches[0]));
      }
      setStatus("Traceability workspace ready.");
    }

    void load();
  }, []);

  const selectedBatch = useMemo(
    () => batches.find((entry) => entry.id === selectedBatchId) ?? null,
    [batches, selectedBatchId],
  );

  function updateForm(partial: Partial<typeof emptyForm>) {
    setForm((current) => ({
      ...current,
      ...partial,
    }));
  }

  async function reloadBatches(selectId?: string) {
    const response = await fetch("/api/admin/traceability/batches", { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as AdminBatchesResponse;
    setRole(data.role);
    setBatches(data.batches);
    const next = selectId ? data.batches.find((entry) => entry.id === selectId) : data.batches[0];
    if (next) {
      setSelectedBatchId(next.id);
      setForm(toForm(next));
    } else {
      setSelectedBatchId("");
      setForm(emptyForm);
    }
  }

  async function createBatch() {
    setSaving(true);
    const response = await fetch("/api/admin/traceability/batches", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        batchCode: form.batchCode,
        qrCode: form.qrCode,
        productSlug: form.productSlug,
        productName: form.productName,
        variantId: form.variantId || undefined,
        status: form.status,
        productionDate: form.productionDate,
        expiryDate: form.expiryDate,
        source: {
          farmName: form.sourceFarmName,
          region: form.sourceRegion,
          country: form.sourceCountry,
          lotReference: form.sourceLotReference,
          harvestedAt: form.sourceHarvestedAt || undefined,
        },
        processing: {
          facilityName: form.facilityName,
          lineName: form.lineName,
          packagedAt: form.packagedAt,
          qaLead: form.qaLead,
        },
        certifications: parseCertifications(form.certificationsText),
        timeline: parseTimeline(form.timelineText),
        adminNotes: form.adminNotes || undefined,
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to create batch.");
      setSaving(false);
      return;
    }

    const data = (await response.json()) as BatchResponse;
    await reloadBatches(data.batch.id);
    setStatus(`Created batch ${data.batch.batchCode}.`);
    setSaving(false);
  }

  async function updateBatch() {
    if (!selectedBatchId) {
      return;
    }

    setSaving(true);
    const response = await fetch(`/api/admin/traceability/batches/${selectedBatchId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        batchCode: form.batchCode,
        qrCode: form.qrCode,
        productSlug: form.productSlug,
        productName: form.productName,
        variantId: form.variantId || undefined,
        status: form.status,
        productionDate: form.productionDate,
        expiryDate: form.expiryDate,
        source: {
          farmName: form.sourceFarmName,
          region: form.sourceRegion,
          country: form.sourceCountry,
          lotReference: form.sourceLotReference,
          harvestedAt: form.sourceHarvestedAt || undefined,
        },
        processing: {
          facilityName: form.facilityName,
          lineName: form.lineName,
          packagedAt: form.packagedAt,
          qaLead: form.qaLead,
        },
        certifications: parseCertifications(form.certificationsText),
        timeline: parseTimeline(form.timelineText),
        adminNotes: form.adminNotes || undefined,
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to update batch.");
      setSaving(false);
      return;
    }

    const data = (await response.json()) as BatchResponse;
    await reloadBatches(data.batch.id);
    setStatus(`Updated batch ${data.batch.batchCode}.`);
    setSaving(false);
  }

  async function importBatches() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(bulkImportText);
    } catch {
      setStatus("Bulk import JSON is invalid.");
      return;
    }

    if (!Array.isArray(parsed)) {
      setStatus("Bulk import payload must be an array.");
      return;
    }

    setSaving(true);
    const response = await fetch("/api/admin/traceability/batches/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        items: parsed,
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Bulk import failed.");
      setSaving(false);
      return;
    }

    const body = (await response.json()) as { imported: number };
    setBulkImportText("");
    await reloadBatches();
    setStatus(`Imported ${body.imported} batches.`);
    setSaving(false);
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-2">
        <Badge>Traceability Admin</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Batch Ingestion & Editor
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Role: <span className="font-semibold">{role}</span>. Create, import, and edit traceability
          batches.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Batches
          </p>
          <select
            value={selectedBatchId}
            onChange={(event) => {
              const id = event.target.value;
              setSelectedBatchId(id);
              const target = batches.find((entry) => entry.id === id);
              if (target) {
                setForm(toForm(target));
              }
            }}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          >
            <option value="">New batch form</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.batchCode} · {batch.productName}
              </option>
            ))}
          </select>

          {selectedBatch ? (
            <div className="rounded-xl border border-neutral-200 p-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              <p>Created: {selectedBatch.createdAt}</p>
              <p>Updated: {selectedBatch.updatedAt}</p>
              <p>Status: {selectedBatch.status}</p>
            </div>
          ) : null}

          <Button variant="secondary" onClick={() => setForm(emptyForm)}>
            Reset Form
          </Button>
        </Card>

        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Batch Form
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={form.batchCode}
              onChange={(event) => updateForm({ batchCode: event.target.value })}
              placeholder="Batch code"
            />
            <Input
              value={form.qrCode}
              onChange={(event) => updateForm({ qrCode: event.target.value })}
              placeholder="QR value/url"
            />
            <Input
              value={form.productSlug}
              onChange={(event) => updateForm({ productSlug: event.target.value })}
              placeholder="Product slug"
            />
            <Input
              value={form.productName}
              onChange={(event) => updateForm({ productName: event.target.value })}
              placeholder="Product name"
            />
            <Input
              value={form.variantId}
              onChange={(event) => updateForm({ variantId: event.target.value })}
              placeholder="Variant ID (optional)"
            />
            <select
              value={form.status}
              onChange={(event) =>
                updateForm({ status: event.target.value as "active" | "recalled" | "sold_out" })
              }
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            >
              <option value="active">active</option>
              <option value="recalled">recalled</option>
              <option value="sold_out">sold_out</option>
            </select>
            <Input
              value={form.productionDate}
              onChange={(event) => updateForm({ productionDate: event.target.value })}
              placeholder="Production date"
            />
            <Input
              value={form.expiryDate}
              onChange={(event) => updateForm({ expiryDate: event.target.value })}
              placeholder="Expiry date"
            />
            <Input
              value={form.sourceFarmName}
              onChange={(event) => updateForm({ sourceFarmName: event.target.value })}
              placeholder="Source farm"
            />
            <Input
              value={form.sourceRegion}
              onChange={(event) => updateForm({ sourceRegion: event.target.value })}
              placeholder="Source region"
            />
            <Input
              value={form.sourceCountry}
              onChange={(event) => updateForm({ sourceCountry: event.target.value })}
              placeholder="Source country"
            />
            <Input
              value={form.sourceLotReference}
              onChange={(event) => updateForm({ sourceLotReference: event.target.value })}
              placeholder="Lot reference"
            />
            <Input
              value={form.sourceHarvestedAt}
              onChange={(event) => updateForm({ sourceHarvestedAt: event.target.value })}
              placeholder="Harvested at (optional)"
            />
            <Input
              value={form.facilityName}
              onChange={(event) => updateForm({ facilityName: event.target.value })}
              placeholder="Facility name"
            />
            <Input
              value={form.lineName}
              onChange={(event) => updateForm({ lineName: event.target.value })}
              placeholder="Line name"
            />
            <Input
              value={form.packagedAt}
              onChange={(event) => updateForm({ packagedAt: event.target.value })}
              placeholder="Packaged at"
            />
            <Input
              value={form.qaLead}
              onChange={(event) => updateForm({ qaLead: event.target.value })}
              placeholder="QA lead"
            />
          </div>

          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">
              Certifications (`Name | Issuer | Code | ValidUntil`, one per line)
            </span>
            <textarea
              value={form.certificationsText}
              onChange={(event) => updateForm({ certificationsText: event.target.value })}
              className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">
              Timeline (`stage | title | description | location | startedAt | completedAt`, one per
              line)
            </span>
            <textarea
              value={form.timelineText}
              onChange={(event) => updateForm({ timelineText: event.target.value })}
              className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">
              Admin Notes
            </span>
            <textarea
              value={form.adminNotes}
              onChange={(event) => updateForm({ adminNotes: event.target.value })}
              className="min-h-20 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <Button onClick={createBatch} disabled={saving}>
              {saving ? "Saving..." : "Create Batch"}
            </Button>
            <Button variant="secondary" onClick={updateBatch} disabled={saving || !selectedBatchId}>
              Update Selected
            </Button>
          </div>
        </Card>
      </div>

      <Card className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Bulk Import
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Paste JSON array matching batch schema and import in one operation.
        </p>
        <textarea
          value={bulkImportText}
          onChange={(event) => setBulkImportText(event.target.value)}
          placeholder='[{"batchCode":"NFL-...","qrCode":"https://...","productSlug":"...","productName":"..."}]'
          className="min-h-40 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 font-mono text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
        />
        <Button
          variant="secondary"
          onClick={importBatches}
          disabled={saving || !bulkImportText.trim()}
        >
          Import Batches
        </Button>
      </Card>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
    </section>
  );
}
