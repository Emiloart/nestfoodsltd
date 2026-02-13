"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useCart } from "./cart-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/commerce/format";
import { type DeliverySlot, type PaymentProvider, type QuoteResult } from "@/lib/commerce/types";

type QuoteResponse = {
  quote: QuoteResult;
};

type DeliverySlotsResponse = {
  deliverySlots: DeliverySlot[];
};

type CheckoutResponse = {
  order: {
    id: string;
    orderNumber: string;
    summary: { currency: "NGN" | "USD"; totalMinor: number };
  };
  payment: {
    provider: PaymentProvider;
    reference: string;
    checkoutUrl: string;
    amountMinor: number;
    currency: "NGN" | "USD";
  };
};

export function CheckoutPageClient() {
  const searchParams = useSearchParams();
  const { items, clear } = useCart();

  const [promoCode, setPromoCode] = useState(searchParams.get("promoCode") ?? "");
  const [deliverySlotId, setDeliverySlotId] = useState(searchParams.get("deliverySlotId") ?? "");
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([]);
  const [quote, setQuote] = useState<QuoteResult | null>(null);

  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("paystack");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("Ready to checkout.");
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResponse | null>(null);

  useEffect(() => {
    async function loadSlots() {
      const response = await fetch("/api/commerce/delivery-slots");
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as DeliverySlotsResponse;
      setDeliverySlots(data.deliverySlots);
      if (!deliverySlotId && data.deliverySlots[0]) {
        setDeliverySlotId(data.deliverySlots[0].id);
      }
    }

    void loadSlots();
  }, [deliverySlotId]);

  useEffect(() => {
    async function refreshQuote() {
      if (items.length === 0) {
        setQuote(null);
        return;
      }

      const response = await fetch("/api/commerce/cart/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items,
          promoCode: promoCode || undefined,
          deliverySlotId: deliverySlotId || undefined,
        }),
      });
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as QuoteResponse;
      setQuote(data.quote);
    }

    void refreshQuote();
  }, [deliverySlotId, items, promoCode]);

  async function handleCheckout() {
    if (items.length === 0) {
      return;
    }

    setSubmitting(true);
    setStatus("Creating order...");
    const response = await fetch("/api/commerce/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        customerEmail,
        customerName: customerName || undefined,
        shippingAddress,
        notes: notes || undefined,
        items,
        promoCode: promoCode || undefined,
        deliverySlotId: deliverySlotId || undefined,
        paymentProvider,
      }),
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(error?.error ?? "Checkout failed.");
      setSubmitting(false);
      return;
    }

    const data = (await response.json()) as CheckoutResponse;
    setCheckoutResult(data);
    setStatus("Order created. Proceed to payment.");
    clear();
    setSubmitting(false);
  }

  const currency = quote?.summary.currency ?? "NGN";

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Checkout</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          One-page checkout with delivery slots, promos, and payment provider selection.
        </p>
      </div>

      {checkoutResult ? (
        <Card className="space-y-3">
          <p className="text-sm text-neutral-700 dark:text-neutral-200">
            Order <span className="font-semibold">{checkoutResult.order.orderNumber}</span> created.
          </p>
          <p className="text-sm text-neutral-700 dark:text-neutral-200">
            Amount:{" "}
            <span className="font-semibold">
              {formatCurrency(checkoutResult.payment.currency, checkoutResult.payment.amountMinor)}
            </span>
          </p>
          <a
            href={checkoutResult.payment.checkoutUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-black dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Pay with {checkoutResult.payment.provider}
          </a>
          <Link href="/account" className="text-sm underline">
            View account orders
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Customer</p>
            <Input
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
              placeholder="Email address"
              type="email"
            />
            <Input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Full name (optional)"
            />
            <Input
              value={shippingAddress}
              onChange={(event) => setShippingAddress(event.target.value)}
              placeholder="Delivery address"
            />
            <Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Delivery notes" />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">Promo</span>
                <Input value={promoCode} onChange={(event) => setPromoCode(event.target.value.toUpperCase())} />
              </label>
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">Delivery Slot</span>
                <select
                  value={deliverySlotId}
                  onChange={(event) => setDeliverySlotId(event.target.value)}
                  className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                >
                  {deliverySlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.label} ({slot.region})
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.14em] text-neutral-500">Payment Provider</span>
              <select
                value={paymentProvider}
                onChange={(event) => setPaymentProvider(event.target.value as PaymentProvider)}
                className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              >
                <option value="paystack">Paystack</option>
                <option value="flutterwave">Flutterwave</option>
              </select>
            </label>
            <Button
              onClick={handleCheckout}
              disabled={submitting || items.length === 0 || !customerEmail || !shippingAddress}
            >
              {submitting ? "Submitting..." : "Create Order"}
            </Button>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
          </Card>

          <Card className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Order Summary</p>
            {quote?.lines.map((line) => (
              <div key={line.variantId} className="flex items-center justify-between text-sm">
                <span className="text-neutral-700 dark:text-neutral-200">
                  {line.productName} × {line.quantity}
                </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(line.currency, line.lineTotalMinor)}
                </span>
              </div>
            ))}
            <div className="space-y-2 border-t border-neutral-200 pt-3 text-sm dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(currency, quote?.summary.subtotalMinor ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Discount</span>
                <span>-{formatCurrency(currency, quote?.summary.discountMinor ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery</span>
                <span>{formatCurrency(currency, quote?.summary.deliveryFeeMinor ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(currency, quote?.summary.totalMinor ?? 0)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </section>
  );
}
