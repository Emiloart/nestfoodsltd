import { unstable_noStore as noStore } from "next/cache";

import { readEnquiriesData, writeEnquiriesData } from "./store";
import { type EnquiryLeadType } from "./types";

const MAX_ENQUIRIES = 10_000;

export async function captureEnquiryLead(input: {
  type: EnquiryLeadType;
  fullName: string;
  phone: string;
  email?: string;
  location?: string;
  productInterest?: string;
  quantity?: string;
  businessType?: string;
  capacity?: string;
  message?: string;
}) {
  const data = await readEnquiriesData();
  const lead = {
    id: crypto.randomUUID(),
    type: input.type,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim().toLowerCase() || undefined,
    location: input.location?.trim() || undefined,
    productInterest: input.productInterest?.trim() || undefined,
    quantity: input.quantity?.trim() || undefined,
    businessType: input.businessType?.trim() || undefined,
    capacity: input.capacity?.trim() || undefined,
    message: input.message?.trim() || undefined,
    status: "new" as const,
    createdAt: new Date().toISOString(),
  };

  data.enquiries.unshift(lead);
  if (data.enquiries.length > MAX_ENQUIRIES) {
    data.enquiries = data.enquiries.slice(0, MAX_ENQUIRIES);
  }

  await writeEnquiriesData(data);
  return lead;
}

export async function listEnquiryLeads(limit = 100) {
  noStore();
  const data = await readEnquiriesData();
  return data.enquiries.slice(0, Math.min(Math.max(limit, 1), 500));
}
