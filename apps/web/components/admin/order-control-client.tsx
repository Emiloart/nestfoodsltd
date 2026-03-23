"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type Order, type OrderStatus, type PaymentWebhookEvent } from "@/lib/commerce/types";

type AdminOrdersResponse = {
  role: string;
  orders: Order[];
};

type OrderResponse = {
  role: string;
  order: Order;
};

type AdminWebhooksResponse = {
  role: string;
  events: PaymentWebhookEvent[];
};

const orderStatusOptions: OrderStatus[] = [
  "created",
  "payment_pending",
  "paid",
  "processing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export function OrderControlClient() {
  const [role, setRole] = useState("Unknown");
  const [orders, setOrders] = useState<Order[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<PaymentWebhookEvent[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [nextStatus, setNextStatus] = useState<OrderStatus>("processing");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("Loading orders...");

  const selectedOrder = useMemo(
    () => orders.find((entry) => entry.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );
  const canWrite = role === "SUPER_ADMIN" || role === "SALES_MANAGER";

  useEffect(() => {
    void reloadOrders();
    void reloadWebhooks();
  }, []);

  useEffect(() => {
    void reloadOrders(selectedOrderId || undefined);
  }, [search, statusFilter]);

  useEffect(() => {
    if (selectedOrder) {
      setNextStatus(selectedOrder.status);
    }
  }, [selectedOrder]);

  async function reloadOrders(preferredOrderId?: string) {
    const searchParams = new URLSearchParams();
    if (search.trim()) {
      searchParams.set("search", search.trim());
    }
    if (statusFilter !== "all") {
      searchParams.set("status", statusFilter);
    }

    const response = await fetch(`/api/admin/orders?${searchParams.toString()}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to load orders.");
      return;
    }

    const data = (await response.json()) as AdminOrdersResponse;
    setRole(data.role);
    setOrders(data.orders);

    const target = preferredOrderId
      ? data.orders.find((entry) => entry.id === preferredOrderId)
      : data.orders[0];
    if (target) {
      setSelectedOrderId(target.id);
    } else {
      setSelectedOrderId("");
    }

    setStatus("Order control ready.");
  }

  async function reloadWebhooks() {
    const response = await fetch("/api/admin/orders/webhooks", { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as AdminWebhooksResponse;
    setWebhookEvents(data.events.slice(0, 10));
  }

  async function updateOrderStatus() {
    if (!selectedOrderId) {
      setStatus("Select an order to update.");
      return;
    }
    if (!canWrite) {
      setStatus("This role has read-only access.");
      return;
    }

    setSaving(true);
    setStatus("Updating order status...");
    const response = await fetch(`/api/admin/orders/${selectedOrderId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status: nextStatus,
        note: note.trim() || undefined,
      }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to update order.");
      setSaving(false);
      return;
    }

    const data = (await response.json()) as OrderResponse;
    await reloadOrders(data.order.id);
    await reloadWebhooks();
    setNote("");
    setStatus(`Updated order ${data.order.orderNumber} to ${data.order.status}.`);
    setSaving(false);
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-2">
        <Badge>Order Admin</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Order Control
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Role: <span className="font-semibold">{role}</span>. Monitor order lifecycle and payment
          webhook events.
        </p>
      </div>

      <Card className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_240px_auto]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by order number, email, customer, or reference"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          >
            <option value="all">All statuses</option>
            {orderStatusOptions.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={() => void reloadOrders(selectedOrderId || undefined)}>
            Refresh
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Orders</p>
          <select
            value={selectedOrderId}
            onChange={(event) => setSelectedOrderId(event.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          >
            <option value="">Select order</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.orderNumber} · {order.status}
              </option>
            ))}
          </select>

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {orders.length} order{orders.length === 1 ? "" : "s"} in current view.
          </p>

          <div className="space-y-2 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Latest webhook events
            </p>
            {webhookEvents.length === 0 ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">No events captured.</p>
            ) : (
              webhookEvents.map((event) => (
                <div key={event.id} className="text-xs text-neutral-500 dark:text-neutral-400">
                  <p>
                    {event.provider} · {event.event}
                  </p>
                  <p>
                    {event.reference} · {event.processed ? "processed" : "pending"} · attempts{" "}
                    {event.attempts}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Order Details
          </p>

          {selectedOrder ? (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-neutral-200 p-3 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-300">
                  <p>Order: {selectedOrder.orderNumber}</p>
                  <p>Email: {selectedOrder.customerEmail}</p>
                  <p>Status: {selectedOrder.status}</p>
                  <p>Provider: {selectedOrder.paymentProvider}</p>
                  <p>Reference: {selectedOrder.paymentReference ?? "N/A"}</p>
                </div>
                <div className="rounded-xl border border-neutral-200 p-3 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-300">
                  <p>Subtotal: {selectedOrder.summary.subtotalMinor}</p>
                  <p>Discount: {selectedOrder.summary.discountMinor}</p>
                  <p>Delivery: {selectedOrder.summary.deliveryFeeMinor}</p>
                  <p>Total: {selectedOrder.summary.totalMinor}</p>
                  <p>Currency: {selectedOrder.summary.currency}</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                <select
                  value={nextStatus}
                  onChange={(event) => setNextStatus(event.target.value as OrderStatus)}
                  className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                >
                  {orderStatusOptions.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
                <Input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Timeline note (optional)"
                />
              </div>

              <Button onClick={updateOrderStatus} disabled={saving || !canWrite}>
                {saving ? "Updating..." : "Update Status"}
              </Button>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  Timeline
                </p>
                {selectedOrder.timeline.map((entry, index) => (
                  <div
                    key={`${entry.at}-${index}`}
                    className="rounded-xl border border-neutral-200 p-3 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-300"
                  >
                    <p>
                      {entry.status} · {entry.at}
                    </p>
                    <p>{entry.note}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Select an order to inspect lifecycle details.
            </p>
          )}
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
        </Card>
      </div>
    </section>
  );
}
