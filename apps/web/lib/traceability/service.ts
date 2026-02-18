import { unstable_noStore as noStore } from "next/cache";

import { readTraceabilityData, writeTraceabilityData } from "./store";
import {
  type TraceabilityBatch,
  type TraceabilityBatchStatus,
  type TraceabilityTimelineEvent,
} from "./types";

function normalizeCode(value: string) {
  return value.trim().toLowerCase();
}

function normalizeBatchCode(value: string) {
  return value.trim().toUpperCase();
}

function normalizeTimelineEvent(
  input: Partial<TraceabilityTimelineEvent>,
): TraceabilityTimelineEvent {
  const now = new Date().toISOString();
  const stage =
    input.stage === "sourcing" ||
    input.stage === "processing" ||
    input.stage === "quality_check" ||
    input.stage === "distribution" ||
    input.stage === "delivery"
      ? input.stage
      : "processing";

  return {
    id: input.id?.trim() || crypto.randomUUID(),
    stage,
    title: input.title?.trim() || "Traceability event",
    description: input.description?.trim() || "No description provided.",
    location: input.location?.trim() || "Unknown location",
    startedAt: input.startedAt?.trim() || now,
    completedAt: input.completedAt?.trim() || undefined,
  };
}

function sortTimelineEvents(events: TraceabilityTimelineEvent[]) {
  return [...events].sort((a, b) => {
    if (a.startedAt < b.startedAt) {
      return -1;
    }
    if (a.startedAt > b.startedAt) {
      return 1;
    }
    return 0;
  });
}

function validStatus(value?: string): TraceabilityBatchStatus {
  if (value === "active" || value === "recalled" || value === "sold_out") {
    return value;
  }
  return "active";
}

export async function lookupTraceabilityBatch(code: string) {
  noStore();
  const normalized = normalizeCode(code);
  if (!normalized) {
    return null;
  }

  const data = await readTraceabilityData();
  return (
    data.batches.find(
      (batch) =>
        normalizeCode(batch.batchCode) === normalized || normalizeCode(batch.qrCode) === normalized,
    ) ?? null
  );
}

export async function listTraceabilityBatches(filters?: {
  search?: string;
  productSlug?: string;
  status?: TraceabilityBatchStatus;
}) {
  noStore();
  const data = await readTraceabilityData();
  let batches = [...data.batches];

  if (filters?.productSlug) {
    batches = batches.filter((entry) => entry.productSlug === filters.productSlug);
  }
  if (filters?.status) {
    batches = batches.filter((entry) => entry.status === filters.status);
  }
  if (filters?.search?.trim()) {
    const query = normalizeCode(filters.search);
    batches = batches.filter((entry) => {
      const haystack = [
        entry.batchCode,
        entry.productName,
        entry.productSlug,
        entry.source.farmName,
        entry.processing.facilityName,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  return batches.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function getTraceabilityBatchById(batchId: string) {
  noStore();
  const data = await readTraceabilityData();
  return data.batches.find((entry) => entry.id === batchId) ?? null;
}

export async function createTraceabilityBatch(
  input: Omit<TraceabilityBatch, "id" | "createdAt" | "updatedAt" | "timeline"> & {
    timeline?: Partial<TraceabilityTimelineEvent>[];
  },
) {
  const data = await readTraceabilityData();
  const now = new Date().toISOString();

  const batch: TraceabilityBatch = {
    id: crypto.randomUUID(),
    batchCode: normalizeBatchCode(input.batchCode),
    qrCode: input.qrCode.trim(),
    productSlug: input.productSlug.trim(),
    productName: input.productName.trim(),
    variantId: input.variantId?.trim() || undefined,
    status: validStatus(input.status),
    productionDate: input.productionDate,
    expiryDate: input.expiryDate,
    source: {
      farmName: input.source.farmName.trim(),
      region: input.source.region.trim(),
      country: input.source.country.trim(),
      lotReference: input.source.lotReference.trim(),
      harvestedAt: input.source.harvestedAt?.trim() || undefined,
    },
    processing: {
      facilityName: input.processing.facilityName.trim(),
      lineName: input.processing.lineName.trim(),
      packagedAt: input.processing.packagedAt,
      qaLead: input.processing.qaLead.trim(),
    },
    certifications: input.certifications.map((entry) => ({
      id: entry.id?.trim() || crypto.randomUUID(),
      name: entry.name.trim(),
      issuer: entry.issuer.trim(),
      certificateCode: entry.certificateCode.trim(),
      validUntil: entry.validUntil?.trim() || undefined,
    })),
    timeline: sortTimelineEvents(
      (input.timeline ?? []).map((entry) => normalizeTimelineEvent(entry)),
    ),
    adminNotes: input.adminNotes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  data.batches.unshift(batch);
  await writeTraceabilityData(data);
  return batch;
}

export async function updateTraceabilityBatch(
  batchId: string,
  input: Partial<
    Omit<TraceabilityBatch, "id" | "createdAt" | "updatedAt" | "timeline"> & {
      timeline: Partial<TraceabilityTimelineEvent>[];
    }
  >,
) {
  const data = await readTraceabilityData();
  const batch = data.batches.find((entry) => entry.id === batchId);
  if (!batch) {
    throw new Error("Traceability batch not found.");
  }

  if (input.batchCode?.trim()) {
    batch.batchCode = normalizeBatchCode(input.batchCode);
  }
  if (input.qrCode?.trim()) {
    batch.qrCode = input.qrCode.trim();
  }
  if (input.productSlug?.trim()) {
    batch.productSlug = input.productSlug.trim();
  }
  if (input.productName?.trim()) {
    batch.productName = input.productName.trim();
  }
  if (input.variantId !== undefined) {
    batch.variantId = input.variantId?.trim() || undefined;
  }
  if (input.status) {
    batch.status = validStatus(input.status);
  }
  if (input.productionDate?.trim()) {
    batch.productionDate = input.productionDate.trim();
  }
  if (input.expiryDate?.trim()) {
    batch.expiryDate = input.expiryDate.trim();
  }
  if (input.adminNotes !== undefined) {
    batch.adminNotes = input.adminNotes?.trim() || undefined;
  }
  if (input.source) {
    batch.source = {
      ...batch.source,
      ...input.source,
      farmName: input.source.farmName?.trim() || batch.source.farmName,
      region: input.source.region?.trim() || batch.source.region,
      country: input.source.country?.trim() || batch.source.country,
      lotReference: input.source.lotReference?.trim() || batch.source.lotReference,
      harvestedAt: input.source.harvestedAt?.trim() || batch.source.harvestedAt,
    };
  }
  if (input.processing) {
    batch.processing = {
      ...batch.processing,
      ...input.processing,
      facilityName: input.processing.facilityName?.trim() || batch.processing.facilityName,
      lineName: input.processing.lineName?.trim() || batch.processing.lineName,
      packagedAt: input.processing.packagedAt || batch.processing.packagedAt,
      qaLead: input.processing.qaLead?.trim() || batch.processing.qaLead,
    };
  }
  if (input.certifications) {
    batch.certifications = input.certifications.map((entry) => ({
      id: entry.id?.trim() || crypto.randomUUID(),
      name: entry.name?.trim() || "Certification",
      issuer: entry.issuer?.trim() || "Unknown issuer",
      certificateCode: entry.certificateCode?.trim() || "N/A",
      validUntil: entry.validUntil?.trim() || undefined,
    }));
  }
  if (input.timeline) {
    batch.timeline = sortTimelineEvents(
      input.timeline.map((entry) => normalizeTimelineEvent(entry)),
    );
  }

  batch.updatedAt = new Date().toISOString();
  await writeTraceabilityData(data);
  return batch;
}

export async function importTraceabilityBatches(
  items: Array<
    Omit<TraceabilityBatch, "id" | "createdAt" | "updatedAt" | "timeline"> & {
      timeline?: Partial<TraceabilityTimelineEvent>[];
    }
  >,
) {
  const created: TraceabilityBatch[] = [];
  for (const item of items) {
    const batch = await createTraceabilityBatch(item);
    created.push(batch);
  }
  return created;
}
