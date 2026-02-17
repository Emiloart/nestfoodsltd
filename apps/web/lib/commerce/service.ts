import { unstable_noStore as noStore } from "next/cache";

import { readCommerceData, writeCommerceData } from "./store";
import {
  type CartLineInput,
  type CheckoutInput,
  type CommerceProduct,
  type Order,
  type OrderStatus,
  type PaymentProvider,
  type QuoteResult,
} from "./types";

type ProductFilters = {
  search?: string;
  category?: string;
  allergenExclude?: string;
  tag?: string;
  inStockOnly?: boolean;
  sort?: "relevance" | "price_asc" | "price_desc";
};

function normalizeSearchValue(value?: string) {
  return value?.trim().toLowerCase();
}

function generateOrderNumber(orderCount: number) {
  const numericPart = String(orderCount + 1).padStart(4, "0");
  return `NFL-${new Date().getFullYear()}-${numericPart}`;
}

function minimumVariantPrice(product: CommerceProduct) {
  return Math.min(...product.variants.map((variant) => variant.priceMinor));
}

function mapPaymentEventToOrderStatus(event: string): OrderStatus {
  const normalized = event.toLowerCase();
  if (normalized.includes("success") || normalized.includes("charge.completed") || normalized.includes("paid")) {
    return "paid";
  }
  if (normalized.includes("failed") || normalized.includes("abandoned")) {
    return "payment_pending";
  }
  return "payment_pending";
}

export async function listCommerceProducts(filters?: ProductFilters) {
  noStore();
  const data = await readCommerceData();
  let products = data.products.filter((product) => product.status === "published");

  const normalizedSearch = normalizeSearchValue(filters?.search);
  if (normalizedSearch) {
    products = products.filter((product) => {
      const haystack = [
        product.name,
        product.shortDescription,
        product.longDescription,
        product.category,
        product.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }

  if (filters?.category) {
    products = products.filter((product) => product.category === filters.category);
  }

  if (filters?.allergenExclude) {
    const allergen = filters.allergenExclude.toLowerCase();
    products = products.filter((product) =>
      product.allergens.every((entry) => !entry.toLowerCase().includes(allergen)),
    );
  }

  if (filters?.tag) {
    const normalizedTag = filters.tag.toLowerCase();
    products = products.filter((product) => product.tags.some((entry) => entry.toLowerCase() === normalizedTag));
  }

  if (filters?.inStockOnly) {
    products = products.filter((product) =>
      product.variants.some((variant) => variant.stockStatus !== "out_of_stock"),
    );
  }

  if (filters?.sort === "price_asc") {
    products = [...products].sort((a, b) => minimumVariantPrice(a) - minimumVariantPrice(b));
  }
  if (filters?.sort === "price_desc") {
    products = [...products].sort((a, b) => minimumVariantPrice(b) - minimumVariantPrice(a));
  }

  return products;
}

export async function listCommerceCategories() {
  noStore();
  const products = await listCommerceProducts();
  return [...new Set(products.map((product) => product.category))];
}

export async function listCommerceFacets() {
  noStore();
  const data = await readCommerceData();
  const products = data.products.filter((product) => product.status === "published");
  const categories = [...new Set(products.map((product) => product.category))];
  const allergens = [...new Set(products.flatMap((product) => product.allergens))];
  const tags = [...new Set(products.flatMap((product) => product.tags))];

  return { categories, allergens, tags };
}

export async function getCommerceProductBySlug(slug: string) {
  noStore();
  const data = await readCommerceData();
  return data.products.find((product) => product.slug === slug && product.status === "published") ?? null;
}

export async function listDeliverySlots() {
  noStore();
  const data = await readCommerceData();
  return data.deliverySlots.filter((slot) => slot.active);
}

function findProductVariant(
  products: CommerceProduct[],
  variantId: string,
): { product: CommerceProduct; variant: CommerceProduct["variants"][number] } | null {
  for (const product of products) {
    const variant = product.variants.find((entry) => entry.id === variantId);
    if (variant) {
      return { product, variant };
    }
  }
  return null;
}

export async function quoteCart(input: {
  items: CartLineInput[];
  promoCode?: string;
  deliverySlotId?: string;
}): Promise<QuoteResult> {
  noStore();
  const data = await readCommerceData();
  const products = data.products.filter((product) => product.status === "published");

  const lines = input.items
    .map((item) => {
      const quantity = Number.isFinite(item.quantity) ? Math.max(1, Math.floor(item.quantity)) : 1;
      const found = findProductVariant(products, item.variantId);
      if (!found) {
        return null;
      }

      return {
        productId: found.product.id,
        productName: found.product.name,
        productSlug: found.product.slug,
        variantId: found.variant.id,
        variantName: found.variant.name,
        quantity,
        unitPriceMinor: found.variant.priceMinor,
        lineTotalMinor: found.variant.priceMinor * quantity,
        currency: found.variant.currency,
        imageUrl: found.product.imageUrl,
      };
    })
    .filter((line): line is NonNullable<typeof line> => Boolean(line));

  if (lines.length === 0) {
    return {
      lines: [],
      summary: {
        currency: "NGN",
        subtotalMinor: 0,
        discountMinor: 0,
        deliveryFeeMinor: 0,
        totalMinor: 0,
      },
    };
  }

  const currency = lines[0].currency;
  const subtotalMinor = lines.reduce((sum, line) => sum + line.lineTotalMinor, 0);

  const deliverySlot = input.deliverySlotId
    ? data.deliverySlots.find((slot) => slot.id === input.deliverySlotId && slot.active)
    : undefined;
  const deliveryFeeMinor = deliverySlot?.feeMinor ?? 0;

  const promoCode = input.promoCode?.trim().toUpperCase();
  const promo = promoCode
    ? data.promos.find((entry) => entry.active && entry.code.toUpperCase() === promoCode)
    : undefined;

  let discountMinor = 0;
  if (promo && promo.currency === currency && subtotalMinor >= promo.minSubtotalMinor) {
    if (promo.type === "percent") {
      discountMinor = Math.round((subtotalMinor * promo.value) / 100);
    } else {
      discountMinor = Math.min(promo.value, subtotalMinor);
    }
  }

  const totalMinor = subtotalMinor - discountMinor + deliveryFeeMinor;

  return {
    lines,
    deliverySlot,
    summary: {
      currency,
      subtotalMinor,
      discountMinor,
      deliveryFeeMinor,
      totalMinor,
      promoCodeApplied: discountMinor > 0 ? promo?.code : undefined,
    },
  };
}

export async function createOrder(input: CheckoutInput) {
  const data = await readCommerceData();
  const quote = await quoteCart({
    items: input.items,
    promoCode: input.promoCode,
    deliverySlotId: input.deliverySlotId,
  });

  if (quote.lines.length === 0) {
    throw new Error("Cannot create order with empty cart.");
  }

  const timestamp = new Date().toISOString();
  const order: Order = {
    id: crypto.randomUUID(),
    orderNumber: generateOrderNumber(data.orders.length),
    customerEmail: input.customerEmail.trim().toLowerCase(),
    customerName: input.customerName?.trim() || undefined,
    shippingAddress: input.shippingAddress.trim(),
    notes: input.notes?.trim() || undefined,
    items: quote.lines,
    summary: quote.summary,
    deliverySlotId: input.deliverySlotId,
    paymentProvider: input.paymentProvider,
    status: "payment_pending",
    timeline: [
      { status: "created", at: timestamp, note: "Order created from checkout." },
      { status: "payment_pending", at: timestamp, note: "Waiting for payment confirmation." },
    ],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  data.orders.unshift(order);
  await writeCommerceData(data);
  return order;
}

export async function listOrdersByEmail(email?: string) {
  noStore();
  const data = await readCommerceData();
  if (!email) {
    return data.orders;
  }
  const normalized = email.trim().toLowerCase();
  return data.orders.filter((order) => order.customerEmail === normalized);
}

export async function getOrderById(orderId: string) {
  noStore();
  const data = await readCommerceData();
  return data.orders.find((order) => order.id === orderId) ?? null;
}

export async function reorderOrder(orderId: string, customerEmail: string, provider: PaymentProvider) {
  const existingOrder = await getOrderById(orderId);
  if (!existingOrder) {
    throw new Error("Original order not found.");
  }

  return createOrder({
    customerEmail,
    customerName: existingOrder.customerName,
    shippingAddress: existingOrder.shippingAddress,
    notes: `Reorder of ${existingOrder.orderNumber}`,
    items: existingOrder.items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
    deliverySlotId: existingOrder.deliverySlotId,
    paymentProvider: provider,
  });
}

export async function listSubscriptionsByEmail(email?: string) {
  noStore();
  const data = await readCommerceData();
  if (!email) {
    return data.subscriptions;
  }
  const normalized = email.trim().toLowerCase();
  return data.subscriptions.filter((entry) => entry.customerEmail === normalized);
}

export async function createPaymentSession(orderId: string, provider: PaymentProvider) {
  const data = await readCommerceData();
  const order = data.orders.find((entry) => entry.id === orderId);
  if (!order) {
    throw new Error("Order not found.");
  }

  const reference = `${provider.toUpperCase()}-${order.orderNumber}-${Date.now()}`;
  order.paymentProvider = provider;
  order.paymentReference = reference;
  order.updatedAt = new Date().toISOString();
  await writeCommerceData(data);

  const checkoutBase =
    provider === "paystack"
      ? "https://checkout.paystack.com/mock-session"
      : "https://checkout.flutterwave.com/mock-session";

  return {
    provider,
    reference,
    checkoutUrl: `${checkoutBase}?reference=${encodeURIComponent(reference)}`,
    amountMinor: order.summary.totalMinor,
    currency: order.summary.currency,
  };
}

export async function handlePaymentWebhook(params: {
  provider: PaymentProvider;
  event: string;
  reference: string;
  payload: Record<string, unknown>;
}) {
  const data = await readCommerceData();
  const now = new Date().toISOString();

  const eventId = String(params.payload.id ?? `${params.provider}-${params.reference}-${params.event}`);
  let webhookEvent = data.webhookEvents.find((entry) => entry.id === eventId);

  if (!webhookEvent) {
    webhookEvent = {
      id: eventId,
      provider: params.provider,
      orderId: "",
      reference: params.reference,
      event: params.event,
      payload: params.payload,
      attempts: 0,
      processed: false,
      createdAt: now,
      updatedAt: now,
    };
    data.webhookEvents.unshift(webhookEvent);
  }

  webhookEvent.attempts += 1;
  webhookEvent.updatedAt = now;

  const order = data.orders.find((entry) => entry.paymentReference === params.reference);
  if (!order) {
    webhookEvent.lastError = "Order not found for payment reference.";
    await writeCommerceData(data);
    return { success: false, retry: webhookEvent.attempts < 5, message: webhookEvent.lastError };
  }

  webhookEvent.orderId = order.id;
  const nextStatus = mapPaymentEventToOrderStatus(params.event);
  order.status = nextStatus;
  order.updatedAt = now;
  order.timeline.unshift({
    status: nextStatus,
    at: now,
    note: `Payment provider ${params.provider} sent event "${params.event}".`,
  });

  webhookEvent.processed = true;
  webhookEvent.processedAt = now;
  webhookEvent.lastError = undefined;
  await writeCommerceData(data);

  return { success: true, retry: false, orderId: order.id, status: nextStatus };
}
