"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useExperience } from "@/components/customer/experience-provider";
import { useCart } from "./cart-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type DeliverySlot, type QuoteResult } from "@/lib/commerce/types";

type QuoteResponse = {
  quote: QuoteResult;
};

type DeliverySlotsResponse = {
  deliverySlots: DeliverySlot[];
};

export function CartPageClient() {
  const { formatMinorAmount } = useExperience();
  const { items, setQuantity, removeItem, clear } = useCart();
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([]);
  const [deliverySlotId, setDeliverySlotId] = useState<string>("");
  const [promoInput, setPromoInput] = useState("");
  const [promoCode, setPromoCode] = useState<string>("");
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [status, setStatus] = useState("Ready");
  const [loading, setLoading] = useState(false);

  const hasItems = items.length > 0;

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
      if (!hasItems) {
        setQuote(null);
        return;
      }

      setLoading(true);
      setStatus("Calculating...");
      const response = await fetch("/api/commerce/cart/quote", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          items,
          promoCode,
          deliverySlotId: deliverySlotId || undefined,
        }),
      });

      if (!response.ok) {
        setStatus("Failed to calculate cart.");
        setLoading(false);
        return;
      }

      const data = (await response.json()) as QuoteResponse;
      setQuote(data.quote);
      setStatus("Cart updated.");
      setLoading(false);
    }

    void refreshQuote();
  }, [deliverySlotId, hasItems, items, promoCode]);

  const summary = quote?.summary;
  const checkoutHref = useMemo(() => {
    if (!summary || !hasItems) {
      return "/checkout";
    }
    const searchParams = new URLSearchParams();
    if (promoCode) {
      searchParams.set("promoCode", promoCode);
    }
    if (deliverySlotId) {
      searchParams.set("deliverySlotId", deliverySlotId);
    }
    return `/checkout?${searchParams.toString()}`;
  }, [deliverySlotId, hasItems, promoCode, summary]);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Cart</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Persistent cart with promo codes and delivery slot pricing.
        </p>
      </div>

      {!hasItems ? (
        <Card className="space-y-3">
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Your cart is empty.</p>
          <Link href="/shop" className="text-sm font-medium text-neutral-900 underline dark:text-neutral-100">
            Browse products
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Items</p>
              <div className="space-y-3">
                {quote?.lines.map((line) => (
                  <div
                    key={line.variantId}
                    className="grid gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800 md:grid-cols-[1fr_auto_auto]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {line.productName} · {line.variantName}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {formatMinorAmount(line.unitPriceMinor, line.currency)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setQuantity(line.variantId, line.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center text-sm">{line.quantity}</span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setQuantity(line.variantId, line.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <div className="flex items-center justify-between gap-2 md:min-w-40 md:justify-end">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {formatMinorAmount(line.lineTotalMinor, line.currency)}
                      </p>
                      <Button variant="ghost" size="sm" onClick={() => removeItem(line.variantId)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="secondary" onClick={clear}>
                Clear Cart
              </Button>
            </Card>

            <Card className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Summary</p>
              <label className="block space-y-2">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
                  Delivery Slot
                </span>
                <select
                  className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                  value={deliverySlotId}
                  onChange={(event) => setDeliverySlotId(event.target.value)}
                >
                  {deliverySlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.label} ({slot.region}) · {formatMinorAmount(slot.feeMinor, slot.currency)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
                  Promo Code
                </span>
                <div className="flex gap-2">
                  <Input
                    value={promoInput}
                    onChange={(event) => setPromoInput(event.target.value.toUpperCase())}
                    placeholder="WELCOME10"
                  />
                  <Button variant="secondary" onClick={() => setPromoCode(promoInput.trim().toUpperCase())}>
                    Apply
                  </Button>
                </div>
              </label>
              <div className="space-y-2 text-sm text-neutral-700 dark:text-neutral-200">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatMinorAmount(summary?.subtotalMinor ?? 0, summary?.currency ?? "NGN")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Discount</span>
                  <span>-{formatMinorAmount(summary?.discountMinor ?? 0, summary?.currency ?? "NGN")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery</span>
                  <span>{formatMinorAmount(summary?.deliveryFeeMinor ?? 0, summary?.currency ?? "NGN")}</span>
                </div>
                <div className="flex items-center justify-between border-t border-neutral-200 pt-2 text-base font-semibold dark:border-neutral-800">
                  <span>Total</span>
                  <span>{formatMinorAmount(summary?.totalMinor ?? 0, summary?.currency ?? "NGN")}</span>
                </div>
              </div>
              <Link
                href={checkoutHref}
                className="inline-flex h-10 w-full items-center justify-center rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-black dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Proceed to Checkout
              </Link>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {loading ? "Refreshing totals..." : status}
              </p>
            </Card>
          </div>
        </>
      )}
    </section>
  );
}
