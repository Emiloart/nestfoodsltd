import { unstable_noStore as noStore } from "next/cache";

import { createCheckoutSession } from "./payments";
import { readCommerceData, writeCommerceData } from "./store";
import {
  type CartLineInput,
  type CheckoutInput,
  type CommerceProduct,
  type NutritionItem,
  type Order,
  type OrderStatus,
  type PaymentWebhookEvent,
  type PaymentProvider,
  type ProductAvailabilityStatus,
  type ProductStatus,
  type ProductVariant,
  type QuoteResult,
} from "./types";

type ProductFilters = {
  search?: string;
  category?: string;
  allergenExclude?: string;
  tag?: string;
  region?: string;
  inStockOnly?: boolean;
  includeUnavailable?: boolean;
  sort?: "relevance" | "price_asc" | "price_desc";
};

type AdminOrderFilters = {
  status?: OrderStatus;
  email?: string;
  search?: string;
};

const DEFAULT_PRODUCT_REGIONS = ["Lagos"];
const DEFAULT_MINIMUM_ORDER_QUANTITY = 10;
const DEFAULT_MAXIMUM_ORDER_QUANTITY = 10000;

function normalizeSearchValue(value?: string) {
  return value?.trim().toLowerCase();
}

function normalizeRegionToken(value: string) {
  return value.trim().toLowerCase();
}

function normalizeProductAvailabilityStatus(value: unknown): ProductAvailabilityStatus {
  return value === "limited" || value === "unavailable" ? value : "available";
}

function normalizeRegions(input: unknown) {
  if (!Array.isArray(input)) {
    return [...DEFAULT_PRODUCT_REGIONS];
  }

  const seen = new Set<string>();
  const regions: string[] = [];
  for (const entry of input) {
    if (typeof entry !== "string") {
      continue;
    }
    const normalized = entry.trim();
    if (!normalized) {
      continue;
    }
    const token = normalizeRegionToken(normalized);
    if (seen.has(token)) {
      continue;
    }
    seen.add(token);
    regions.push(normalized);
  }

  if (regions.length === 0) {
    return [...DEFAULT_PRODUCT_REGIONS];
  }
  return regions;
}

function normalizeOrderQuantityRange(
  minInput: unknown,
  maxInput: unknown,
): {
  minimumOrderQuantity: number;
  maximumOrderQuantity: number;
} {
  const minCandidate = Number(minInput);
  const minimumOrderQuantity = Number.isFinite(minCandidate)
    ? Math.max(1, Math.min(1_000_000, Math.round(minCandidate)))
    : DEFAULT_MINIMUM_ORDER_QUANTITY;

  const maxCandidate = Number(maxInput);
  const maximumOrderQuantity = Number.isFinite(maxCandidate)
    ? Math.max(
        minimumOrderQuantity,
        Math.min(1_000_000, Math.round(maxCandidate)),
      )
    : Math.max(minimumOrderQuantity, DEFAULT_MAXIMUM_ORDER_QUANTITY);

  return { minimumOrderQuantity, maximumOrderQuantity };
}

function normalizeCommerceProduct(product: CommerceProduct): CommerceProduct {
  const { minimumOrderQuantity, maximumOrderQuantity } = normalizeOrderQuantityRange(
    product.minimumOrderQuantity,
    product.maximumOrderQuantity,
  );

  return {
    ...product,
    availabilityStatus: normalizeProductAvailabilityStatus(product.availabilityStatus),
    availableRegions: normalizeRegions(product.availableRegions),
    minimumOrderQuantity,
    maximumOrderQuantity,
  };
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
  if (
    normalized.includes("success") ||
    normalized.includes("charge.completed") ||
    normalized.includes("paid")
  ) {
    return "paid";
  }
  if (normalized.includes("failed") || normalized.includes("abandoned")) {
    return "payment_pending";
  }
  return "payment_pending";
}

const orderTransitionMap: Record<OrderStatus, OrderStatus[]> = {
  created: ["payment_pending", "cancelled"],
  payment_pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled"],
  processing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: ["delivered"],
  cancelled: ["cancelled"],
};

function canTransitionOrderStatus(current: OrderStatus, next: OrderStatus) {
  if (current === next) {
    return true;
  }
  return orderTransitionMap[current].includes(next);
}

export async function listCommerceProducts(filters?: ProductFilters) {
  noStore();
  const data = await readCommerceData();
  let products = data.products
    .map((product) => normalizeCommerceProduct(product))
    .filter((product) => product.status === "published");

  if (!filters?.includeUnavailable) {
    products = products.filter((product) => product.availabilityStatus !== "unavailable");
  }

  const normalizedSearch = normalizeSearchValue(filters?.search);
  if (normalizedSearch) {
    products = products.filter((product) => {
      const haystack = [
        product.name,
        product.shortDescription,
        product.longDescription,
        product.category,
        product.tags.join(" "),
        product.availableRegions.join(" "),
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
    products = products.filter((product) =>
      product.tags.some((entry) => entry.toLowerCase() === normalizedTag),
    );
  }

  if (filters?.region) {
    const regionToken = normalizeRegionToken(filters.region);
    products = products.filter((product) =>
      product.availableRegions.some((entry) => normalizeRegionToken(entry) === regionToken),
    );
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
  const products = data.products
    .map((product) => normalizeCommerceProduct(product))
    .filter(
      (product) => product.status === "published" && product.availabilityStatus !== "unavailable",
    );
  const categories = [...new Set(products.map((product) => product.category))];
  const allergens = [...new Set(products.flatMap((product) => product.allergens))];
  const tags = [...new Set(products.flatMap((product) => product.tags))];
  const regions = [...new Set(products.flatMap((product) => product.availableRegions))];

  return { categories, allergens, tags, regions };
}

export async function getCommerceProductBySlug(slug: string) {
  noStore();
  const data = await readCommerceData();
  const product = data.products.find((entry) => entry.slug === slug && entry.status === "published");
  if (!product) {
    return null;
  }
  return normalizeCommerceProduct(product);
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

function isProductAvailableForRegion(product: CommerceProduct, region?: string) {
  if (!region) {
    return true;
  }
  const targetRegion = normalizeRegionToken(region);
  return product.availableRegions.some((entry) => normalizeRegionToken(entry) === targetRegion);
}

function assertVariantCanBeOrdered(input: {
  product: CommerceProduct;
  variant: CommerceProduct["variants"][number];
  quantity: number;
  deliveryRegion?: string;
}) {
  const { product, variant, quantity, deliveryRegion } = input;
  if (product.availabilityStatus === "unavailable") {
    throw new Error(`${product.name} is currently unavailable for ordering.`);
  }
  if (!isProductAvailableForRegion(product, deliveryRegion)) {
    throw new Error(`${product.name} is not available in ${deliveryRegion}.`);
  }
  if (variant.stockStatus === "out_of_stock") {
    throw new Error(`${product.name} (${variant.name}) is currently out of stock.`);
  }
  if (quantity < product.minimumOrderQuantity) {
    throw new Error(
      `${product.name} requires a minimum order of ${product.minimumOrderQuantity} units.`,
    );
  }
  if (quantity > product.maximumOrderQuantity) {
    throw new Error(
      `${product.name} allows a maximum order of ${product.maximumOrderQuantity} units.`,
    );
  }
}

export async function quoteCart(input: {
  items: CartLineInput[];
  promoCode?: string;
  deliverySlotId?: string;
}): Promise<QuoteResult> {
  noStore();
  const data = await readCommerceData();
  const products = data.products
    .map((product) => normalizeCommerceProduct(product))
    .filter((product) => product.status === "published");
  const deliverySlot = input.deliverySlotId
    ? data.deliverySlots.find((slot) => slot.id === input.deliverySlotId && slot.active)
    : undefined;
  const deliveryRegion = deliverySlot?.region;

  const lines = input.items
    .map((item) => {
      const quantity = Number.isFinite(item.quantity) ? Math.max(1, Math.floor(item.quantity)) : 1;
      const found = findProductVariant(products, item.variantId);
      if (!found) {
        return null;
      }

      assertVariantCanBeOrdered({
        product: found.product,
        variant: found.variant,
        quantity,
        deliveryRegion,
      });

      return {
        productId: found.product.id,
        productName: found.product.name,
        productSlug: found.product.slug,
        productAvailabilityStatus: found.product.availabilityStatus,
        availableRegions: found.product.availableRegions,
        minimumOrderQuantity: found.product.minimumOrderQuantity,
        maximumOrderQuantity: found.product.maximumOrderQuantity,
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

  const firstLine = lines[0];
  if (!firstLine) {
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

  const currency = firstLine.currency;
  const subtotalMinor = lines.reduce((sum, line) => sum + line.lineTotalMinor, 0);

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

export async function listAdminOrders(filters?: AdminOrderFilters) {
  noStore();
  const data = await readCommerceData();
  let orders = [...data.orders];

  if (filters?.status) {
    orders = orders.filter((order) => order.status === filters.status);
  }
  if (filters?.email) {
    const normalizedEmail = filters.email.trim().toLowerCase();
    orders = orders.filter((order) => order.customerEmail === normalizedEmail);
  }
  if (filters?.search) {
    const token = filters.search.trim().toLowerCase();
    if (token) {
      orders = orders.filter((order) => {
        const haystack = [
          order.orderNumber,
          order.customerEmail,
          order.customerName ?? "",
          order.paymentReference ?? "",
          order.status,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(token);
      });
    }
  }

  return orders.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function getAdminOrderById(orderId: string) {
  return getOrderById(orderId);
}

export async function updateAdminOrderStatus(input: {
  orderId: string;
  status: OrderStatus;
  note?: string;
  actorRole?: string;
}) {
  const data = await readCommerceData();
  const order = data.orders.find((entry) => entry.id === input.orderId);
  if (!order) {
    throw new Error("Order not found.");
  }

  if (!canTransitionOrderStatus(order.status, input.status)) {
    throw new Error(`Invalid status transition: ${order.status} -> ${input.status}`);
  }

  const timestamp = new Date().toISOString();
  order.status = input.status;
  order.updatedAt = timestamp;
  order.timeline.unshift({
    status: input.status,
    at: timestamp,
    note:
      input.note?.trim() ||
      `Order status updated by admin${input.actorRole ? ` (${input.actorRole})` : ""}.`,
  });

  await writeCommerceData(data);
  return order;
}

export async function listAdminPaymentWebhookEvents(filters?: {
  provider?: PaymentProvider;
  processed?: boolean;
}) {
  noStore();
  const data = await readCommerceData();
  let events: PaymentWebhookEvent[] = [...data.webhookEvents];

  if (filters?.provider) {
    events = events.filter((entry) => entry.provider === filters.provider);
  }
  if (filters?.processed !== undefined) {
    events = events.filter((entry) => entry.processed === filters.processed);
  }

  return events.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function reorderOrder(
  orderId: string,
  customerEmail: string,
  provider: PaymentProvider,
) {
  const existingOrder = await getOrderById(orderId);
  if (!existingOrder) {
    throw new Error("Original order not found.");
  }

  return createOrder({
    customerEmail,
    customerName: existingOrder.customerName,
    shippingAddress: existingOrder.shippingAddress,
    notes: `Reorder of ${existingOrder.orderNumber}`,
    items: existingOrder.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    })),
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
  return createCheckoutSession({ provider, order, reference });
}

export async function handlePaymentWebhook(params: {
  provider: PaymentProvider;
  event: string;
  reference: string;
  payload: Record<string, unknown>;
}) {
  const data = await readCommerceData();
  const now = new Date().toISOString();

  const eventId = String(
    params.payload.id ?? `${params.provider}-${params.reference}-${params.event}`,
  );
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

type AdminCreateProductInput = Omit<CommerceProduct, "id" | "updatedAt"> & {
  id?: string;
};

type AdminUpdateProductInput = Partial<Omit<CommerceProduct, "id" | "updatedAt">>;

function buildProductId(slug: string) {
  return `prod-${slug}-${crypto.randomUUID().slice(0, 8)}`;
}

function normalizeVariantId(productSlug: string, variant: ProductVariant, index: number) {
  if (variant.id.trim()) {
    return variant.id.trim();
  }
  const suffix = variant.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `var-${productSlug}-${suffix || index + 1}`;
}

function ensureUniqueProductSlug(products: CommerceProduct[], slug: string, productId?: string) {
  const normalizedSlug = slug.trim().toLowerCase();
  const duplicate = products.find(
    (entry) => entry.slug.toLowerCase() === normalizedSlug && entry.id !== productId,
  );
  if (duplicate) {
    throw new Error("A product with this slug already exists.");
  }
}

function normalizeNutritionTable(input: NutritionItem[]) {
  return input.map((entry) => ({
    label: entry.label.trim(),
    amount: Number(entry.amount),
    unit: entry.unit.trim(),
  }));
}

function normalizeVariants(productSlug: string, input: ProductVariant[]) {
  const seenIds = new Set<string>();
  return input.map((entry, index) => {
    const id = normalizeVariantId(productSlug, entry, index);
    if (seenIds.has(id)) {
      throw new Error(`Duplicate variant id "${id}" in payload.`);
    }
    seenIds.add(id);
    return {
      ...entry,
      id,
      name: entry.name.trim(),
      sku: entry.sku.trim(),
      sizeLabel: entry.sizeLabel?.trim() || undefined,
      priceMinor: Math.round(Number(entry.priceMinor)),
    };
  });
}

function normalizeProductStatus(value: string): ProductStatus {
  return value === "draft" ? "draft" : "published";
}

export async function listAdminCommerceProducts() {
  noStore();
  const data = await readCommerceData();
  return data.products.map((product) => normalizeCommerceProduct(product));
}

export async function getAdminCommerceProductById(productId: string) {
  noStore();
  const data = await readCommerceData();
  const product = data.products.find((entry) => entry.id === productId);
  if (!product) {
    return null;
  }
  return normalizeCommerceProduct(product);
}

export async function createAdminCommerceProduct(input: AdminCreateProductInput) {
  const data = await readCommerceData();
  ensureUniqueProductSlug(data.products, input.slug);

  const productId = input.id?.trim() || buildProductId(input.slug);
  if (data.products.some((entry) => entry.id === productId)) {
    throw new Error("A product with this id already exists.");
  }

  if (input.variants.length === 0) {
    throw new Error("At least one variant is required.");
  }

  const { minimumOrderQuantity, maximumOrderQuantity } = normalizeOrderQuantityRange(
    input.minimumOrderQuantity,
    input.maximumOrderQuantity,
  );
  const now = new Date().toISOString();
  const product: CommerceProduct = {
    id: productId,
    slug: input.slug.trim().toLowerCase(),
    status: normalizeProductStatus(input.status),
    availabilityStatus: normalizeProductAvailabilityStatus(input.availabilityStatus),
    availableRegions: normalizeRegions(input.availableRegions),
    minimumOrderQuantity,
    maximumOrderQuantity,
    name: input.name.trim(),
    category: input.category.trim(),
    shortDescription: input.shortDescription.trim(),
    longDescription: input.longDescription.trim(),
    imageUrl: input.imageUrl.trim(),
    galleryUrls: input.galleryUrls.map((entry) => entry.trim()).filter(Boolean),
    tags: input.tags.map((entry) => entry.trim()).filter(Boolean),
    allergens: input.allergens.map((entry) => entry.trim()).filter(Boolean),
    ingredients: input.ingredients.map((entry) => entry.trim()).filter(Boolean),
    shelfLifeDays: Math.max(1, Math.round(Number(input.shelfLifeDays))),
    nutritionTable: normalizeNutritionTable(input.nutritionTable),
    variants: normalizeVariants(input.slug, input.variants),
    updatedAt: now,
  };

  data.products.unshift(product);
  await writeCommerceData(data);
  return product;
}

export async function updateAdminCommerceProduct(
  productId: string,
  input: AdminUpdateProductInput,
) {
  const data = await readCommerceData();
  const productIndex = data.products.findIndex((entry) => entry.id === productId);
  const existingProduct = data.products[productIndex];
  if (!existingProduct) {
    throw new Error("Product not found.");
  }
  const product = normalizeCommerceProduct(existingProduct);

  const nextSlug = input.slug ? input.slug.trim().toLowerCase() : product.slug;
  ensureUniqueProductSlug(data.products, nextSlug, productId);

  if (input.variants && input.variants.length === 0) {
    throw new Error("At least one variant is required.");
  }

  product.slug = nextSlug;
  if (input.status) {
    product.status = normalizeProductStatus(input.status);
  }
  if (input.availabilityStatus !== undefined) {
    product.availabilityStatus = normalizeProductAvailabilityStatus(input.availabilityStatus);
  }
  if (input.availableRegions !== undefined) {
    product.availableRegions = normalizeRegions(input.availableRegions);
  }
  if (input.name !== undefined) {
    product.name = input.name.trim();
  }
  if (input.category !== undefined) {
    product.category = input.category.trim();
  }
  if (input.shortDescription !== undefined) {
    product.shortDescription = input.shortDescription.trim();
  }
  if (input.longDescription !== undefined) {
    product.longDescription = input.longDescription.trim();
  }
  if (input.imageUrl !== undefined) {
    product.imageUrl = input.imageUrl.trim();
  }
  if (input.galleryUrls) {
    product.galleryUrls = input.galleryUrls.map((entry) => entry.trim()).filter(Boolean);
  }
  if (input.tags) {
    product.tags = input.tags.map((entry) => entry.trim()).filter(Boolean);
  }
  if (input.allergens) {
    product.allergens = input.allergens.map((entry) => entry.trim()).filter(Boolean);
  }
  if (input.ingredients) {
    product.ingredients = input.ingredients.map((entry) => entry.trim()).filter(Boolean);
  }
  if (input.shelfLifeDays !== undefined) {
    product.shelfLifeDays = Math.max(1, Math.round(Number(input.shelfLifeDays)));
  }
  if (input.nutritionTable) {
    product.nutritionTable = normalizeNutritionTable(input.nutritionTable);
  }
  if (input.variants) {
    product.variants = normalizeVariants(nextSlug, input.variants);
  }
  const { minimumOrderQuantity, maximumOrderQuantity } = normalizeOrderQuantityRange(
    input.minimumOrderQuantity ?? product.minimumOrderQuantity,
    input.maximumOrderQuantity ?? product.maximumOrderQuantity,
  );
  product.minimumOrderQuantity = minimumOrderQuantity;
  product.maximumOrderQuantity = maximumOrderQuantity;
  product.updatedAt = new Date().toISOString();
  data.products[productIndex] = product;

  await writeCommerceData(data);
  return product;
}

export async function deleteAdminCommerceProduct(productId: string) {
  const data = await readCommerceData();
  const productIndex = data.products.findIndex((entry) => entry.id === productId);
  if (productIndex < 0) {
    throw new Error("Product not found.");
  }

  const product = data.products[productIndex];
  if (!product) {
    throw new Error("Product not found.");
  }
  const variantIds = new Set(product.variants.map((entry) => entry.id));
  const orderLinked = data.orders.some((order) =>
    order.items.some((line) => line.productId === productId || variantIds.has(line.variantId)),
  );
  if (orderLinked) {
    throw new Error("Cannot delete product that is linked to orders.");
  }

  const subscriptionLinked = data.subscriptions.some((entry) => variantIds.has(entry.variantId));
  if (subscriptionLinked) {
    throw new Error("Cannot delete product that is linked to subscriptions.");
  }

  const deleted = data.products.splice(productIndex, 1)[0];
  if (!deleted) {
    throw new Error("Product not found.");
  }
  await writeCommerceData(data);
  return deleted;
}
