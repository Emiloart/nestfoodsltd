import { unstable_noStore as noStore } from "next/cache";

import { type AdminRole } from "@/lib/admin/auth";
import { readCommerceData } from "@/lib/commerce/store";

import { readB2BData, writeB2BData } from "./store";
import {
  type B2BAccount,
  type B2BAccountStatus,
  type B2BOrder,
  type B2BQuoteInputItem,
  type B2BQuoteLine,
  type B2BQuoteRequest,
  type B2BQuoteStatus,
  type B2BQuoteSummary,
  type B2BSupportTicket,
  type B2BTier,
} from "./types";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeCompanyName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function generateSequence(prefix: string, count: number) {
  const numericPart = String(count + 1).padStart(4, "0");
  return `${prefix}-${new Date().getFullYear()}-${numericPart}`;
}

function resolveEstimatedFulfillmentDays(totalUnits: number) {
  if (totalUnits <= 40) {
    return 2;
  }
  if (totalUnits <= 120) {
    return 4;
  }
  return 7;
}

function findTierDiscountPercent(tier: B2BTier, accountsDiscounts: Awaited<ReturnType<typeof readB2BData>>["pricingTiers"]) {
  return accountsDiscounts.find((entry) => entry.tier === tier)?.discountPercent ?? 0;
}

export const B2B_SESSION_COOKIE_NAME = "nest_b2b_account_id";

export async function getB2BAccountById(accountId: string) {
  noStore();
  const data = await readB2BData();
  return data.accounts.find((entry) => entry.id === accountId) ?? null;
}

export async function getB2BAccountByEmail(email: string) {
  noStore();
  const normalized = normalizeEmail(email);
  const data = await readB2BData();
  return data.accounts.find((entry) => entry.email === normalized) ?? null;
}

export async function createOrGetB2BAccount(input: {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
}) {
  const normalizedEmail = normalizeEmail(input.email);
  const data = await readB2BData();
  const existing = data.accounts.find((entry) => entry.email === normalizedEmail);
  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const account: B2BAccount = {
    id: crypto.randomUUID(),
    companyName: normalizeCompanyName(input.companyName),
    contactName: input.contactName.trim(),
    email: normalizedEmail,
    phone: input.phone?.trim() || undefined,
    status: "pending_approval",
    tier: "starter",
    regions: ["Lagos"],
    createdAt: now,
    updatedAt: now,
  };

  data.accounts.push(account);
  await writeB2BData(data);
  return account;
}

export async function updateB2BAccountProfile(
  accountId: string,
  input: {
    companyName?: string;
    contactName?: string;
    phone?: string;
    regions?: string[];
  },
) {
  const data = await readB2BData();
  const account = data.accounts.find((entry) => entry.id === accountId);
  if (!account) {
    throw new Error("B2B account not found.");
  }

  if (input.companyName?.trim()) {
    account.companyName = normalizeCompanyName(input.companyName);
  }
  if (input.contactName?.trim()) {
    account.contactName = input.contactName.trim();
  }
  if (input.phone?.trim()) {
    account.phone = input.phone.trim();
  }
  if (input.regions) {
    account.regions = [...new Set(input.regions.map((entry) => entry.trim()).filter(Boolean))];
  }

  account.updatedAt = new Date().toISOString();
  await writeB2BData(data);
  return account;
}

export async function listB2BAccounts(filters?: { status?: B2BAccountStatus }) {
  noStore();
  const data = await readB2BData();
  if (!filters?.status) {
    return data.accounts;
  }
  return data.accounts.filter((entry) => entry.status === filters.status);
}

export async function approveB2BAccount(
  accountId: string,
  input: {
    tier: B2BTier;
    accountManagerName: string;
    accountManagerEmail: string;
    accountManagerPhone?: string;
    status?: Extract<B2BAccountStatus, "approved" | "suspended">;
    regions?: string[];
  },
) {
  const data = await readB2BData();
  const account = data.accounts.find((entry) => entry.id === accountId);
  if (!account) {
    throw new Error("B2B account not found.");
  }

  account.tier = input.tier;
  account.status = input.status ?? "approved";
  account.accountManagerName = input.accountManagerName.trim();
  account.accountManagerEmail = normalizeEmail(input.accountManagerEmail);
  account.accountManagerPhone = input.accountManagerPhone?.trim() || undefined;
  if (input.regions) {
    account.regions = [...new Set(input.regions.map((entry) => entry.trim()).filter(Boolean))];
  }
  account.updatedAt = new Date().toISOString();

  await writeB2BData(data);
  return account;
}

export async function listB2BCatalogForAccount(accountId: string) {
  noStore();
  const account = await getB2BAccountById(accountId);
  if (!account) {
    throw new Error("B2B account not found.");
  }

  const [b2bData, commerceData] = await Promise.all([readB2BData(), readCommerceData()]);
  const discountPercent = findTierDiscountPercent(account.tier, b2bData.pricingTiers);

  const catalog = commerceData.products
    .filter((product) => product.status === "published")
    .map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      imageUrl: product.imageUrl,
      variants: product.variants.map((variant) => {
        const discountedPriceMinor = Math.max(
          0,
          Math.round((variant.priceMinor * (100 - discountPercent)) / 100),
        );
        return {
          id: variant.id,
          name: variant.name,
          sku: variant.sku,
          stockStatus: variant.stockStatus,
          currency: variant.currency,
          listPriceMinor: variant.priceMinor,
          tierPriceMinor: discountedPriceMinor,
          discountPercent,
        };
      }),
    }));

  return {
    tier: account.tier,
    pricing: b2bData.pricingTiers.find((entry) => entry.tier === account.tier) ?? null,
    catalog,
  };
}

export async function buildB2BQuote(accountId: string, items: B2BQuoteInputItem[]) {
  const account = await getB2BAccountById(accountId);
  if (!account) {
    throw new Error("B2B account not found.");
  }
  if (account.status !== "approved") {
    throw new Error("B2B account is not approved for quoting yet.");
  }

  const [b2bData, commerceData] = await Promise.all([readB2BData(), readCommerceData()]);
  const discountPercent = findTierDiscountPercent(account.tier, b2bData.pricingTiers);

  const lines: B2BQuoteLine[] = [];
  for (const item of items) {
    const quantity = Math.max(1, Math.floor(item.quantity));
    const product = commerceData.products.find(
      (entry) => entry.status === "published" && entry.variants.some((variant) => variant.id === item.variantId),
    );
    if (!product) {
      continue;
    }
    const variant = product.variants.find((entry) => entry.id === item.variantId);
    if (!variant) {
      continue;
    }

    const unitPriceMinor = Math.max(0, Math.round((variant.priceMinor * (100 - discountPercent)) / 100));
    lines.push({
      productSlug: product.slug,
      productName: product.name,
      variantId: variant.id,
      variantName: variant.name,
      quantity,
      listPriceMinor: variant.priceMinor,
      unitPriceMinor,
      lineTotalMinor: unitPriceMinor * quantity,
      currency: variant.currency,
    });
  }

  if (lines.length === 0) {
    throw new Error("No valid items were provided for quote.");
  }

  const currency = lines[0]?.currency ?? "NGN";
  const subtotalMinor = lines.reduce((sum, line) => sum + line.listPriceMinor * line.quantity, 0);
  const totalMinor = lines.reduce((sum, line) => sum + line.lineTotalMinor, 0);
  const discountMinor = subtotalMinor - totalMinor;
  const totalUnits = lines.reduce((sum, line) => sum + line.quantity, 0);

  const summary: B2BQuoteSummary = {
    currency,
    subtotalMinor,
    discountMinor,
    totalMinor,
    estimatedFulfillmentDays: resolveEstimatedFulfillmentDays(totalUnits),
  };

  return { lines, summary, tier: account.tier, discountPercent };
}

export async function createB2BQuoteRequest(
  accountId: string,
  input: {
    items: B2BQuoteInputItem[];
    notes?: string;
    preferredDeliveryDate?: string;
  },
) {
  const [data, quote] = await Promise.all([readB2BData(), buildB2BQuote(accountId, input.items)]);
  const now = new Date().toISOString();

  const request: B2BQuoteRequest = {
    id: crypto.randomUUID(),
    quoteNumber: generateSequence("B2B-Q", data.quoteRequests.length),
    accountId,
    items: input.items,
    quotedLines: quote.lines,
    summary: quote.summary,
    notes: input.notes?.trim() || undefined,
    preferredDeliveryDate: input.preferredDeliveryDate?.trim() || undefined,
    status: "submitted",
    timeline: [
      {
        status: "submitted",
        at: now,
        note: "Quote request submitted by buyer.",
        by: "buyer",
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  data.quoteRequests.unshift(request);
  await writeB2BData(data);
  return request;
}

export async function listB2BQuoteRequests(accountId: string) {
  noStore();
  const data = await readB2BData();
  return data.quoteRequests.filter((entry) => entry.accountId === accountId);
}

export async function getB2BQuoteRequestById(accountId: string, quoteId: string) {
  noStore();
  const data = await readB2BData();
  return data.quoteRequests.find((entry) => entry.id === quoteId && entry.accountId === accountId) ?? null;
}

export async function updateB2BQuoteStatusAsAdmin(
  quoteId: string,
  input: {
    status: Exclude<B2BQuoteStatus, "converted_to_order">;
    note: string;
    role: AdminRole;
  },
) {
  const data = await readB2BData();
  const request = data.quoteRequests.find((entry) => entry.id === quoteId);
  if (!request) {
    throw new Error("Quote request not found.");
  }

  request.status = input.status;
  request.updatedAt = new Date().toISOString();
  request.reviewedByRole = input.role;
  request.timeline.unshift({
    status: input.status,
    at: request.updatedAt,
    note: input.note,
    by: "manager",
  });

  await writeB2BData(data);
  return request;
}

export async function convertB2BQuoteToOrder(accountId: string, quoteId: string) {
  const data = await readB2BData();
  const quote = data.quoteRequests.find((entry) => entry.id === quoteId && entry.accountId === accountId);
  if (!quote) {
    throw new Error("Quote request not found.");
  }
  if (!(quote.status === "quoted" || quote.status === "approved")) {
    throw new Error("Quote is not ready for conversion to order.");
  }

  const now = new Date().toISOString();
  quote.status = "converted_to_order";
  quote.updatedAt = now;
  quote.timeline.unshift({
    status: "converted_to_order",
    at: now,
    note: "Buyer accepted quote and converted to order.",
    by: "buyer",
  });

  const order: B2BOrder = {
    id: crypto.randomUUID(),
    orderNumber: generateSequence("B2B", data.orders.length),
    accountId,
    quoteRequestId: quote.id,
    items: quote.quotedLines,
    summary: quote.summary,
    status: "received",
    expectedDeliveryAt: new Date(Date.now() + quote.summary.estimatedFulfillmentDays * 24 * 60 * 60 * 1000).toISOString(),
    trackingCode: `NFL-B2B-TRK-${String(data.orders.length + 1).padStart(3, "0")}`,
    timeline: [{ status: "received", at: now, note: "Order created from approved quote." }],
    createdAt: now,
    updatedAt: now,
  };

  data.orders.unshift(order);

  const invoiceAmountMinor = order.summary.totalMinor;
  data.invoices.unshift({
    id: crypto.randomUUID(),
    invoiceNumber: generateSequence("NFL-INV-B2B", data.invoices.length),
    accountId,
    orderId: order.id,
    amountMinor: invoiceAmountMinor,
    paidMinor: 0,
    balanceMinor: invoiceAmountMinor,
    currency: order.summary.currency,
    status: "issued",
    issuedAt: now,
    dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    fileUrl: "/placeholders/section-image-placeholder.svg",
    updatedAt: now,
  });

  await writeB2BData(data);
  return { quote, order };
}

export async function listB2BOrders(accountId: string) {
  noStore();
  const data = await readB2BData();
  return data.orders.filter((entry) => entry.accountId === accountId);
}

export async function listB2BInvoices(accountId: string) {
  noStore();
  const data = await readB2BData();
  return data.invoices.filter((entry) => entry.accountId === accountId);
}

export async function getB2BInvoiceById(accountId: string, invoiceId: string) {
  noStore();
  const data = await readB2BData();
  return data.invoices.find((entry) => entry.id === invoiceId && entry.accountId === accountId) ?? null;
}

export async function listB2BStatements(accountId: string) {
  noStore();
  const data = await readB2BData();
  return data.statements.filter((entry) => entry.accountId === accountId);
}

export async function listB2BSupportTickets(accountId: string) {
  noStore();
  const data = await readB2BData();
  return data.supportTickets.filter((entry) => entry.accountId === accountId);
}

export async function createB2BSupportTicket(
  accountId: string,
  input: {
    subject: string;
    description: string;
    channel: B2BSupportTicket["channel"];
    priority: B2BSupportTicket["priority"];
  },
) {
  const data = await readB2BData();
  const account = data.accounts.find((entry) => entry.id === accountId);
  if (!account) {
    throw new Error("B2B account not found.");
  }

  const now = new Date().toISOString();
  const ticket: B2BSupportTicket = {
    id: crypto.randomUUID(),
    accountId,
    subject: input.subject.trim(),
    description: input.description.trim(),
    channel: input.channel,
    priority: input.priority,
    status: "open",
    assignedTo: account.accountManagerEmail,
    openedAt: now,
    updatedAt: now,
  };

  data.supportTickets.unshift(ticket);
  await writeB2BData(data);
  return ticket;
}

export async function getB2BAccountManager(accountId: string) {
  noStore();
  const account = await getB2BAccountById(accountId);
  if (!account) {
    return null;
  }

  return {
    name: account.accountManagerName ?? "Pending assignment",
    email: account.accountManagerEmail,
    phone: account.accountManagerPhone,
  };
}
