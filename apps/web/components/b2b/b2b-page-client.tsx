"use client";

import { useEffect, useMemo, useState } from "react";

import { useExperience } from "@/components/customer/experience-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type B2BAccount, type B2BInvoice, type B2BOrder, type B2BQuoteRequest, type B2BStatement, type B2BSupportTicket } from "@/lib/b2b/types";

type B2BSessionResponse = {
  authenticated: boolean;
  account?: B2BAccount;
};

type B2BCatalogResponse = {
  account: B2BAccount;
  tier: "starter" | "growth" | "enterprise";
  pricing: {
    label: string;
    discountPercent: number;
    minimumOrderMinor: number;
    quoteReviewHours: number;
  } | null;
  catalog: {
    id: string;
    slug: string;
    name: string;
    category: string;
    imageUrl: string;
    variants: {
      id: string;
      name: string;
      sku: string;
      stockStatus: string;
      currency: "NGN" | "USD";
      listPriceMinor: number;
      tierPriceMinor: number;
      discountPercent: number;
    }[];
  }[];
};

type B2BQuotePreviewResponse = {
  preview: {
    lines: {
      productSlug: string;
      productName: string;
      variantId: string;
      variantName: string;
      quantity: number;
      listPriceMinor: number;
      unitPriceMinor: number;
      lineTotalMinor: number;
      currency: "NGN" | "USD";
    }[];
    summary: {
      currency: "NGN" | "USD";
      subtotalMinor: number;
      discountMinor: number;
      totalMinor: number;
      estimatedFulfillmentDays: number;
    };
    tier: string;
    discountPercent: number;
  };
};

export function B2BPageClient() {
  const { formatMinorAmount } = useExperience();

  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [status, setStatus] = useState("Ready.");
  const [loading, setLoading] = useState(false);

  const [companyName, setCompanyName] = useState("Prime Retail Distribution Ltd");
  const [contactName, setContactName] = useState("Ada Okafor");
  const [email, setEmail] = useState("ada@primeretail.ng");
  const [phone, setPhone] = useState("+2348090001111");

  const [account, setAccount] = useState<B2BAccount | null>(null);
  const [catalog, setCatalog] = useState<B2BCatalogResponse["catalog"]>([]);
  const [pricing, setPricing] = useState<B2BCatalogResponse["pricing"]>(null);
  const [quotes, setQuotes] = useState<B2BQuoteRequest[]>([]);
  const [orders, setOrders] = useState<B2BOrder[]>([]);
  const [invoices, setInvoices] = useState<B2BInvoice[]>([]);
  const [statements, setStatements] = useState<B2BStatement[]>([]);
  const [tickets, setTickets] = useState<B2BSupportTicket[]>([]);
  const [accountManager, setAccountManager] = useState<{ name: string; email?: string; phone?: string } | null>(null);

  const [draftVariantId, setDraftVariantId] = useState("");
  const [draftQuantity, setDraftQuantity] = useState(10);
  const [draftItems, setDraftItems] = useState<{ variantId: string; quantity: number }[]>([]);
  const [draftNotes, setDraftNotes] = useState("");
  const [draftPreferredDate, setDraftPreferredDate] = useState("");
  const [quotePreview, setQuotePreview] = useState<B2BQuotePreviewResponse["preview"] | null>(null);

  const [ticketSubject, setTicketSubject] = useState("Dispatch ETA request");
  const [ticketDescription, setTicketDescription] = useState("Please share latest dispatch ETA and truck details.");
  const [ticketPriority, setTicketPriority] = useState<"low" | "normal" | "high">("normal");
  const [ticketChannel, setTicketChannel] = useState<"portal" | "email" | "phone" | "whatsapp">("portal");

  const variantOptions = useMemo(
    () =>
      catalog.flatMap((product) =>
        product.variants.map((variant) => ({
          ...variant,
          productName: product.name,
        })),
      ),
    [catalog],
  );

  const draftItemsHydrated = useMemo(
    () =>
      draftItems
        .map((item) => {
          const variant = variantOptions.find((entry) => entry.id === item.variantId);
          if (!variant) {
            return null;
          }
          return {
            ...item,
            productName: variant.productName,
            variantName: variant.name,
            currency: variant.currency,
            tierPriceMinor: variant.tierPriceMinor,
          };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    [draftItems, variantOptions],
  );

  useEffect(() => {
    async function restoreSession() {
      const response = await fetch("/api/b2b/session");
      if (!response.ok) {
        setAuthChecked(true);
        return;
      }

      const data = (await response.json()) as B2BSessionResponse;
      if (!data.authenticated || !data.account) {
        setAuthChecked(true);
        return;
      }

      setAuthenticated(true);
      setAccount(data.account);
      setCompanyName(data.account.companyName);
      setContactName(data.account.contactName);
      setEmail(data.account.email);
      setPhone(data.account.phone ?? "");
      await loadPortalData();
      setAuthChecked(true);
    }

    void restoreSession();
  }, []);

  async function loadPortalData() {
    const [
      accountResponse,
      catalogResponse,
      quotesResponse,
      ordersResponse,
      invoicesResponse,
      statementsResponse,
      managerResponse,
      ticketsResponse,
    ] = await Promise.all([
      fetch("/api/b2b/account"),
      fetch("/api/b2b/catalog"),
      fetch("/api/b2b/quotes"),
      fetch("/api/b2b/orders"),
      fetch("/api/b2b/invoices"),
      fetch("/api/b2b/statements"),
      fetch("/api/b2b/account-manager"),
      fetch("/api/b2b/support/tickets"),
    ]);

    if (!accountResponse.ok) {
      setStatus("Could not load B2B account.");
      return;
    }
    const accountData = (await accountResponse.json()) as { account: B2BAccount };
    setAccount(accountData.account);

    if (catalogResponse.ok) {
      const catalogData = (await catalogResponse.json()) as B2BCatalogResponse;
      setCatalog(catalogData.catalog);
      setPricing(catalogData.pricing);
      if (!draftVariantId && catalogData.catalog[0]?.variants[0]) {
        setDraftVariantId(catalogData.catalog[0].variants[0].id);
      }
    } else {
      setCatalog([]);
      setPricing(null);
    }

    if (quotesResponse.ok) {
      const data = (await quotesResponse.json()) as { quoteRequests: B2BQuoteRequest[] };
      setQuotes(data.quoteRequests);
    }
    if (ordersResponse.ok) {
      const data = (await ordersResponse.json()) as { orders: B2BOrder[] };
      setOrders(data.orders);
    }
    if (invoicesResponse.ok) {
      const data = (await invoicesResponse.json()) as { invoices: B2BInvoice[] };
      setInvoices(data.invoices);
    }
    if (statementsResponse.ok) {
      const data = (await statementsResponse.json()) as { statements: B2BStatement[] };
      setStatements(data.statements);
    }
    if (managerResponse.ok) {
      const data = (await managerResponse.json()) as {
        accountManager: { name: string; email?: string; phone?: string } | null;
      };
      setAccountManager(data.accountManager);
    }
    if (ticketsResponse.ok) {
      const data = (await ticketsResponse.json()) as { tickets: B2BSupportTicket[] };
      setTickets(data.tickets);
    }
  }

  async function signInOrRequestAccess() {
    setLoading(true);
    setStatus("Submitting B2B access request...");
    const response = await fetch("/api/b2b/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        companyName,
        contactName,
        email,
        phone: phone || undefined,
      }),
    });

    if (!response.ok) {
      setStatus("Failed to sign in or request access.");
      setLoading(false);
      return;
    }

    const data = (await response.json()) as B2BSessionResponse;
    setAuthenticated(true);
    setAccount(data.account ?? null);
    setStatus("B2B session active.");
    await loadPortalData();
    setLoading(false);
  }

  async function signOut() {
    await fetch("/api/b2b/session", { method: "DELETE" });
    setAuthenticated(false);
    setAccount(null);
    setCatalog([]);
    setQuotes([]);
    setOrders([]);
    setInvoices([]);
    setStatements([]);
    setTickets([]);
    setQuotePreview(null);
    setDraftItems([]);
    setStatus("Signed out from B2B portal.");
  }

  async function saveAccountProfile() {
    if (!account) {
      return;
    }

    const response = await fetch("/api/b2b/account", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        companyName,
        contactName,
        phone,
      }),
    });

    if (!response.ok) {
      setStatus("Failed to update B2B profile.");
      return;
    }

    const data = (await response.json()) as { account: B2BAccount };
    setAccount(data.account);
    setStatus("B2B profile updated.");
  }

  function addDraftItem() {
    if (!draftVariantId || !Number.isFinite(draftQuantity) || draftQuantity <= 0) {
      return;
    }

    setDraftItems((current) => {
      const existing = current.find((entry) => entry.variantId === draftVariantId);
      if (!existing) {
        return [...current, { variantId: draftVariantId, quantity: Math.floor(draftQuantity) }];
      }
      return current.map((entry) =>
        entry.variantId === draftVariantId
          ? { ...entry, quantity: Math.floor(entry.quantity + draftQuantity) }
          : entry,
      );
    });
  }

  function removeDraftItem(variantId: string) {
    setDraftItems((current) => current.filter((entry) => entry.variantId !== variantId));
  }

  async function previewQuote() {
    if (draftItems.length === 0) {
      return;
    }

    const response = await fetch("/api/b2b/quotes/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: draftItems }),
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(error?.error ?? "Quote preview failed.");
      return;
    }

    const data = (await response.json()) as B2BQuotePreviewResponse;
    setQuotePreview(data.preview);
    setStatus("Quote preview ready.");
  }

  async function submitQuoteRequest() {
    if (draftItems.length === 0) {
      return;
    }

    const response = await fetch("/api/b2b/quotes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        items: draftItems,
        notes: draftNotes || undefined,
        preferredDeliveryDate: draftPreferredDate || undefined,
      }),
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(error?.error ?? "Failed to submit quote request.");
      return;
    }

    setStatus("Quote request submitted.");
    setDraftItems([]);
    setDraftNotes("");
    setDraftPreferredDate("");
    setQuotePreview(null);
    await loadPortalData();
  }

  async function convertQuoteToOrder(quoteId: string) {
    const response = await fetch(`/api/b2b/quotes/${quoteId}/convert-order`, {
      method: "POST",
    });
    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(error?.error ?? "Failed to convert quote to order.");
      return;
    }

    setStatus("Quote converted to order.");
    await loadPortalData();
  }

  async function createTicket() {
    const response = await fetch("/api/b2b/support/tickets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        subject: ticketSubject,
        description: ticketDescription,
        channel: ticketChannel,
        priority: ticketPriority,
      }),
    });

    if (!response.ok) {
      setStatus("Failed to create support ticket.");
      return;
    }

    setStatus("Support ticket opened.");
    await loadPortalData();
  }

  async function openInvoiceDownload(invoiceId: string) {
    const response = await fetch(`/api/b2b/invoices/${invoiceId}/download`);
    if (!response.ok) {
      setStatus("Invoice download link unavailable.");
      return;
    }

    const data = (await response.json()) as { downloadUrl: string };
    window.open(data.downloadUrl, "_blank", "noopener,noreferrer");
  }

  if (!authChecked) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
        <Card>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Loading B2B portal session...</p>
        </Card>
      </section>
    );
  }

  if (!authenticated) {
    return (
      <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Distributor Portal
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Sign in or request approval to unlock bulk ordering, custom pricing tiers, and account-managed support.
          </p>
        </div>

        <Card className="grid gap-3 md:grid-cols-2">
          <Input value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Company name" />
          <Input value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Contact name" />
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Business email" type="email" />
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" />
          <div className="md:col-span-2">
            <Button onClick={signInOrRequestAccess} disabled={loading || !companyName || !contactName || !email}>
              {loading ? "Submitting..." : "Continue to Portal"}
            </Button>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 md:col-span-2">{status}</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">B2B Portal</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Bulk ordering, quote management, invoices, statements, and account-manager support.
          </p>
        </div>
        <Button variant="secondary" onClick={signOut}>
          Sign out
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Account</p>
          <Input value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Company name" />
          <Input value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Contact name" />
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" />
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Status: <span className="font-semibold uppercase">{account?.status ?? "unknown"}</span> · Tier: <span className="font-semibold uppercase">{account?.tier ?? "n/a"}</span>
          </p>
          <Button onClick={saveAccountProfile}>Save Profile</Button>
        </Card>

        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Account Manager</p>
          <p className="text-sm text-neutral-700 dark:text-neutral-200">{accountManager?.name ?? "Pending assignment"}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{accountManager?.email ?? "No manager email yet"}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{accountManager?.phone ?? "No manager phone yet"}</p>
          {pricing ? (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Pricing Tier: {pricing.label} · {pricing.discountPercent}% discount · quote SLA {pricing.quoteReviewHours}h
            </p>
          ) : null}
        </Card>
      </div>

      {account?.status !== "approved" ? (
        <Card className="space-y-3">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Approval in progress</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            Your distributor profile is pending review. Once approved by the sales team, bulk catalog pricing and quote tools will unlock automatically.
          </p>
        </Card>
      ) : (
        <>
          <Card className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Bulk Quote Builder</p>
            <div className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
              <select
                value={draftVariantId}
                onChange={(event) => setDraftVariantId(event.target.value)}
                className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              >
                <option value="">Select variant</option>
                {variantOptions.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.productName} · {variant.name} ({formatMinorAmount(variant.tierPriceMinor, variant.currency)})
                  </option>
                ))}
              </select>
              <Input
                type="number"
                min={1}
                value={draftQuantity}
                onChange={(event) => setDraftQuantity(Number(event.target.value))}
                placeholder="Qty"
              />
              <Button onClick={addDraftItem} disabled={!draftVariantId || draftQuantity <= 0}>
                Add Item
              </Button>
            </div>

            {draftItemsHydrated.length === 0 ? (
              <p className="text-sm text-neutral-600 dark:text-neutral-300">No items added yet.</p>
            ) : (
              <div className="space-y-2">
                {draftItemsHydrated.map((item) => (
                  <div key={item.variantId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                    <p className="text-sm text-neutral-800 dark:text-neutral-200">
                      {item.productName} · {item.variantName} × {item.quantity}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{formatMinorAmount(item.tierPriceMinor * item.quantity, item.currency)}</span>
                      <Button size="sm" variant="ghost" onClick={() => removeDraftItem(item.variantId)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <Input value={draftPreferredDate} onChange={(event) => setDraftPreferredDate(event.target.value)} placeholder="Preferred delivery date (YYYY-MM-DD)" />
              <Input value={draftNotes} onChange={(event) => setDraftNotes(event.target.value)} placeholder="Quote notes (warehouses, split delivery, etc.)" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={previewQuote} disabled={draftItems.length === 0}>
                Preview Quote
              </Button>
              <Button onClick={submitQuoteRequest} disabled={draftItems.length === 0}>
                Submit Quote Request
              </Button>
            </div>

            {quotePreview ? (
              <div className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                <p className="text-sm text-neutral-700 dark:text-neutral-200">
                  Preview total: <span className="font-semibold">{formatMinorAmount(quotePreview.summary.totalMinor, quotePreview.summary.currency)}</span>
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Discount: {formatMinorAmount(quotePreview.summary.discountMinor, quotePreview.summary.currency)} · Estimated fulfillment: {quotePreview.summary.estimatedFulfillmentDays} days
                </p>
              </div>
            ) : null}
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Quote Requests</p>
              {quotes.length === 0 ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-300">No quote requests yet.</p>
              ) : (
                <div className="space-y-2">
                  {quotes.map((quote) => (
                    <div key={quote.id} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{quote.quoteNumber}</p>
                        <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{quote.status}</p>
                      </div>
                      <p className="text-sm text-neutral-700 dark:text-neutral-200">
                        {formatMinorAmount(quote.summary.totalMinor, quote.summary.currency)}
                      </p>
                      {(quote.status === "quoted" || quote.status === "approved") ? (
                        <Button size="sm" variant="secondary" onClick={() => convertQuoteToOrder(quote.id)} className="mt-2">
                          Convert to Order
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Order Tracking</p>
              {orders.length === 0 ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-300">No B2B orders yet.</p>
              ) : (
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div key={order.id} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{order.orderNumber}</p>
                        <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{order.status}</p>
                      </div>
                      <p className="text-sm text-neutral-700 dark:text-neutral-200">
                        {formatMinorAmount(order.summary.totalMinor, order.summary.currency)} · Tracking {order.trackingCode ?? "pending"}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Expected delivery: {order.expectedDeliveryAt ? new Date(order.expectedDeliveryAt).toLocaleString("en-NG") : "TBD"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Invoices</p>
              {invoices.length === 0 ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-300">No invoices yet.</p>
              ) : (
                <div className="space-y-2">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                      <p className="text-sm font-semibold">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-200">
                        Amount {formatMinorAmount(invoice.amountMinor, invoice.currency)} · Balance {formatMinorAmount(invoice.balanceMinor, invoice.currency)}
                      </p>
                      <Button size="sm" variant="secondary" onClick={() => openInvoiceDownload(invoice.id)} className="mt-2">
                        Download Invoice
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Statements</p>
              {statements.length === 0 ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-300">No statements yet.</p>
              ) : (
                <div className="space-y-2">
                  {statements.map((statement) => (
                    <a
                      key={statement.id}
                      href={statement.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl border border-neutral-200 p-3 transition hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-900"
                    >
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{statement.periodLabel}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Billed {formatMinorAmount(statement.totalBilledMinor, statement.currency)} · Paid {formatMinorAmount(statement.totalPaidMinor, statement.currency)}
                      </p>
                    </a>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Support</p>
            <div className="grid gap-3 md:grid-cols-2">
              <Input value={ticketSubject} onChange={(event) => setTicketSubject(event.target.value)} placeholder="Subject" />
              <Input
                value={ticketDescription}
                onChange={(event) => setTicketDescription(event.target.value)}
                placeholder="Describe your issue"
              />
              <select
                value={ticketChannel}
                onChange={(event) => setTicketChannel(event.target.value as typeof ticketChannel)}
                className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              >
                <option value="portal">Portal</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
              <select
                value={ticketPriority}
                onChange={(event) => setTicketPriority(event.target.value as typeof ticketPriority)}
                className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            <Button variant="secondary" onClick={createTicket}>
              Open Support Ticket
            </Button>

            <div className="space-y-2">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{ticket.subject}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{ticket.status}</p>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {ticket.channel} · {ticket.priority} · assigned {ticket.assignedTo ?? "pending"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
    </section>
  );
}
