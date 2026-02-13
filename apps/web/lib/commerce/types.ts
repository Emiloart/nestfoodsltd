export type CurrencyCode = "NGN" | "USD";

export type ProductStatus = "draft" | "published";

export type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  sizeLabel?: string;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  priceMinor: number;
  currency: CurrencyCode;
  subscriptionEligible: boolean;
};

export type NutritionItem = {
  label: string;
  amount: number;
  unit: string;
};

export type CommerceProduct = {
  id: string;
  slug: string;
  status: ProductStatus;
  name: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  imageUrl: string;
  galleryUrls: string[];
  tags: string[];
  allergens: string[];
  ingredients: string[];
  shelfLifeDays: number;
  nutritionTable: NutritionItem[];
  variants: ProductVariant[];
  updatedAt: string;
};

export type PromoCode = {
  code: string;
  label: string;
  type: "percent" | "fixed";
  value: number;
  currency: CurrencyCode;
  minSubtotalMinor: number;
  active: boolean;
};

export type DeliverySlot = {
  id: string;
  label: string;
  startsAt: string;
  endsAt: string;
  region: string;
  feeMinor: number;
  currency: CurrencyCode;
  active: boolean;
};

export type CartLineInput = {
  variantId: string;
  quantity: number;
};

export type CartLineQuote = {
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string;
  variantName: string;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
  currency: CurrencyCode;
  imageUrl: string;
};

export type QuoteBreakdown = {
  currency: CurrencyCode;
  subtotalMinor: number;
  discountMinor: number;
  deliveryFeeMinor: number;
  totalMinor: number;
  promoCodeApplied?: string;
};

export type QuoteResult = {
  lines: CartLineQuote[];
  summary: QuoteBreakdown;
  deliverySlot?: DeliverySlot;
};

export type OrderStatus =
  | "created"
  | "payment_pending"
  | "paid"
  | "processing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type OrderTimelineEvent = {
  status: OrderStatus;
  at: string;
  note: string;
};

export type PaymentProvider = "paystack" | "flutterwave";

export type Order = {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName?: string;
  shippingAddress: string;
  notes?: string;
  items: CartLineQuote[];
  summary: QuoteBreakdown;
  deliverySlotId?: string;
  paymentProvider: PaymentProvider;
  paymentReference?: string;
  status: OrderStatus;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionFrequency = "weekly" | "biweekly" | "monthly";

export type SubscriptionStatus = "active" | "paused" | "cancelled";

export type Subscription = {
  id: string;
  customerEmail: string;
  variantId: string;
  quantity: number;
  frequency: SubscriptionFrequency;
  status: SubscriptionStatus;
  nextChargeAt: string;
  provider: PaymentProvider;
  createdAt: string;
  updatedAt: string;
};

export type PaymentWebhookEvent = {
  id: string;
  provider: PaymentProvider;
  orderId: string;
  reference: string;
  event: string;
  payload: Record<string, unknown>;
  attempts: number;
  processed: boolean;
  processedAt?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
};

export type CommerceData = {
  products: CommerceProduct[];
  promos: PromoCode[];
  deliverySlots: DeliverySlot[];
  orders: Order[];
  subscriptions: Subscription[];
  webhookEvents: PaymentWebhookEvent[];
};

export type CheckoutInput = {
  customerEmail: string;
  customerName?: string;
  shippingAddress: string;
  notes?: string;
  items: CartLineInput[];
  promoCode?: string;
  deliverySlotId?: string;
  paymentProvider: PaymentProvider;
};
