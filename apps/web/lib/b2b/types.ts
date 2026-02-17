import { type AdminRole } from "@/lib/admin/auth";
import { type CurrencyCode } from "@/lib/commerce/types";

export type B2BAccountStatus = "pending_approval" | "approved" | "suspended";
export type B2BTier = "starter" | "growth" | "enterprise";

export type B2BPricingTier = {
  tier: B2BTier;
  label: string;
  discountPercent: number;
  minimumOrderMinor: number;
  quoteReviewHours: number;
};

export type B2BAccount = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  status: B2BAccountStatus;
  tier: B2BTier;
  regions: string[];
  accountManagerName?: string;
  accountManagerEmail?: string;
  accountManagerPhone?: string;
  createdAt: string;
  updatedAt: string;
};

export type B2BQuoteInputItem = {
  variantId: string;
  quantity: number;
};

export type B2BQuoteLine = {
  productSlug: string;
  productName: string;
  variantId: string;
  variantName: string;
  quantity: number;
  listPriceMinor: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
  currency: CurrencyCode;
};

export type B2BQuoteSummary = {
  currency: CurrencyCode;
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
  estimatedFulfillmentDays: number;
};

export type B2BQuoteStatus =
  | "submitted"
  | "reviewing"
  | "quoted"
  | "approved"
  | "rejected"
  | "converted_to_order";

export type B2BQuoteTimelineEvent = {
  status: B2BQuoteStatus;
  at: string;
  note: string;
  by?: "system" | "buyer" | "manager";
};

export type B2BQuoteRequest = {
  id: string;
  quoteNumber: string;
  accountId: string;
  items: B2BQuoteInputItem[];
  quotedLines: B2BQuoteLine[];
  summary: B2BQuoteSummary;
  notes?: string;
  preferredDeliveryDate?: string;
  status: B2BQuoteStatus;
  timeline: B2BQuoteTimelineEvent[];
  reviewedByRole?: AdminRole;
  createdAt: string;
  updatedAt: string;
};

export type B2BOrderStatus =
  | "received"
  | "processing"
  | "ready_for_dispatch"
  | "in_transit"
  | "delivered"
  | "cancelled";

export type B2BOrderTimelineEvent = {
  status: B2BOrderStatus;
  at: string;
  note: string;
};

export type B2BOrder = {
  id: string;
  orderNumber: string;
  accountId: string;
  quoteRequestId?: string;
  items: B2BQuoteLine[];
  summary: B2BQuoteSummary;
  status: B2BOrderStatus;
  expectedDeliveryAt?: string;
  trackingCode?: string;
  timeline: B2BOrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
};

export type B2BInvoiceStatus = "draft" | "issued" | "partially_paid" | "paid" | "overdue";

export type B2BInvoice = {
  id: string;
  invoiceNumber: string;
  accountId: string;
  orderId: string;
  amountMinor: number;
  paidMinor: number;
  balanceMinor: number;
  currency: CurrencyCode;
  status: B2BInvoiceStatus;
  issuedAt: string;
  dueAt: string;
  fileUrl: string;
  updatedAt: string;
};

export type B2BStatement = {
  id: string;
  accountId: string;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  totalBilledMinor: number;
  totalPaidMinor: number;
  balanceMinor: number;
  currency: CurrencyCode;
  generatedAt: string;
  fileUrl: string;
};

export type B2BSupportTicketStatus = "open" | "in_progress" | "resolved";

export type B2BSupportTicket = {
  id: string;
  accountId: string;
  subject: string;
  description: string;
  channel: "portal" | "email" | "phone" | "whatsapp";
  priority: "low" | "normal" | "high";
  status: B2BSupportTicketStatus;
  assignedTo?: string;
  openedAt: string;
  updatedAt: string;
};

export type B2BData = {
  pricingTiers: B2BPricingTier[];
  accounts: B2BAccount[];
  quoteRequests: B2BQuoteRequest[];
  orders: B2BOrder[];
  invoices: B2BInvoice[];
  statements: B2BStatement[];
  supportTickets: B2BSupportTicket[];
};
