export type TraceabilityBatchStatus = "active" | "recalled" | "sold_out";

export type TraceabilitySource = {
  farmName: string;
  region: string;
  country: string;
  lotReference: string;
  harvestedAt?: string;
};

export type TraceabilityProcessing = {
  facilityName: string;
  lineName: string;
  packagedAt: string;
  qaLead: string;
};

export type TraceabilityCertification = {
  id: string;
  name: string;
  issuer: string;
  certificateCode: string;
  validUntil?: string;
};

export type TraceabilityTimelineEvent = {
  id: string;
  stage: "sourcing" | "processing" | "quality_check" | "distribution" | "delivery";
  title: string;
  description: string;
  location: string;
  startedAt: string;
  completedAt?: string;
};

export type TraceabilityBatch = {
  id: string;
  batchCode: string;
  qrCode: string;
  productSlug: string;
  productName: string;
  variantId?: string;
  status: TraceabilityBatchStatus;
  productionDate: string;
  expiryDate: string;
  source: TraceabilitySource;
  processing: TraceabilityProcessing;
  certifications: TraceabilityCertification[];
  timeline: TraceabilityTimelineEvent[];
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type TraceabilityData = {
  batches: TraceabilityBatch[];
};
