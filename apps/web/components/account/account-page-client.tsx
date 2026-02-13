"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/commerce/format";
import { type Order, type Subscription } from "@/lib/commerce/types";

type OrdersResponse = {
  orders: Order[];
};

type SubscriptionsResponse = {
  subscriptions: Subscription[];
};

export function AccountPageClient() {
  const [email, setEmail] = useState("customer@example.com");
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [status, setStatus] = useState("Enter email to load account data.");
  const [loading, setLoading] = useState(false);

  async function loadAccountData() {
    if (!email) {
      return;
    }

    setLoading(true);
    setStatus("Loading account data...");

    const [ordersResponse, subscriptionsResponse] = await Promise.all([
      fetch(`/api/commerce/orders?email=${encodeURIComponent(email)}`),
      fetch(`/api/commerce/subscriptions?email=${encodeURIComponent(email)}`),
    ]);

    if (!ordersResponse.ok || !subscriptionsResponse.ok) {
      setStatus("Failed to load account data.");
      setLoading(false);
      return;
    }

    const ordersData = (await ordersResponse.json()) as OrdersResponse;
    const subscriptionsData = (await subscriptionsResponse.json()) as SubscriptionsResponse;
    setOrders(ordersData.orders);
    setSubscriptions(subscriptionsData.subscriptions);
    setStatus("Account data loaded.");
    setLoading(false);
  }

  async function reorder(orderId: string) {
    const response = await fetch(`/api/commerce/orders/${orderId}/reorder`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        customerEmail: email,
        paymentProvider: "paystack",
      }),
    });

    if (!response.ok) {
      setStatus("Reorder failed.");
      return;
    }

    setStatus("Reorder created.");
    await loadAccountData();
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Account Dashboard
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          View order timeline, subscriptions, and trigger one-click reorders.
        </p>
      </div>

      <Card className="space-y-3">
        <label className="block space-y-2">
          <span className="text-xs uppercase tracking-[0.15em] text-neutral-500">Customer Email</span>
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="customer@example.com" />
        </label>
        <Button onClick={loadAccountData} disabled={loading || !email}>
          {loading ? "Loading..." : "Load Account"}
        </Button>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Orders</p>
          {orders.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">No orders found.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="space-y-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">{order.status}</p>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    Total: {formatCurrency(order.summary.currency, order.summary.totalMinor)}
                  </p>
                  <div className="space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {order.timeline.slice(0, 3).map((event) => (
                      <p key={`${order.id}-${event.status}-${event.at}`}>
                        {new Date(event.at).toLocaleString("en-NG")} · {event.status}
                      </p>
                    ))}
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => reorder(order.id)}>
                    Reorder
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Subscriptions</p>
          {subscriptions.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">No active subscriptions.</p>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Variant: {entry.variantId}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {entry.frequency} · {entry.status} · next charge{" "}
                    {new Date(entry.nextChargeAt).toLocaleDateString("en-NG")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
