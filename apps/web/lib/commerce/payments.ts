import { type Order, type PaymentProvider } from "./types";

type CheckoutSessionInput = {
  provider: PaymentProvider;
  order: Order;
  reference: string;
};

function resolvePaymentMode() {
  const mode = (process.env.PAYMENT_MODE ?? "mock").trim().toLowerCase();
  return mode === "live" ? "live" : "mock";
}

function resolveSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
}

function resolvePaystackCallbackUrl() {
  return (
    process.env.PAYSTACK_CALLBACK_URL?.trim() ||
    `${resolveSiteUrl()}/checkout?provider=paystack&status=callback`
  );
}

function resolveFlutterwaveRedirectUrl() {
  return (
    process.env.FLW_REDIRECT_URL?.trim() ||
    `${resolveSiteUrl()}/checkout?provider=flutterwave&status=callback`
  );
}

async function createMockCheckoutSession(input: CheckoutSessionInput) {
  const checkoutBase =
    input.provider === "paystack"
      ? "https://checkout.paystack.com/mock-session"
      : "https://checkout.flutterwave.com/mock-session";

  return {
    provider: input.provider,
    reference: input.reference,
    checkoutUrl: `${checkoutBase}?reference=${encodeURIComponent(input.reference)}`,
    amountMinor: input.order.summary.totalMinor,
    currency: input.order.summary.currency,
    mode: "mock" as const,
  };
}

async function createPaystackLiveCheckoutSession(input: CheckoutSessionInput) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is required for live payments.");
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      authorization: `Bearer ${secretKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email: input.order.customerEmail,
      amount: input.order.summary.totalMinor,
      currency: input.order.summary.currency,
      reference: input.reference,
      callback_url: resolvePaystackCallbackUrl(),
      metadata: {
        orderId: input.order.id,
        orderNumber: input.order.orderNumber,
        provider: input.provider,
      },
    }),
  });

  const body = (await response.json().catch(() => null)) as
    | {
        status?: boolean;
        message?: string;
        data?: { authorization_url?: string };
      }
    | null;

  if (!response.ok || !body?.status || !body.data?.authorization_url) {
    throw new Error(body?.message || "Failed to initialize Paystack payment session.");
  }

  return {
    provider: input.provider,
    reference: input.reference,
    checkoutUrl: body.data.authorization_url,
    amountMinor: input.order.summary.totalMinor,
    currency: input.order.summary.currency,
    mode: "live" as const,
  };
}

async function createFlutterwaveLiveCheckoutSession(input: CheckoutSessionInput) {
  const secretKey = process.env.FLW_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("FLW_SECRET_KEY is required for live payments.");
  }

  const response = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      authorization: `Bearer ${secretKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: input.reference,
      amount: Number((input.order.summary.totalMinor / 100).toFixed(2)),
      currency: input.order.summary.currency,
      redirect_url: resolveFlutterwaveRedirectUrl(),
      customer: {
        email: input.order.customerEmail,
        name: input.order.customerName || input.order.customerEmail,
      },
      customizations: {
        title: "Nest Foods Ltd Checkout",
        description: `Order ${input.order.orderNumber}`,
      },
      meta: {
        orderId: input.order.id,
        orderNumber: input.order.orderNumber,
        provider: input.provider,
      },
    }),
  });

  const body = (await response.json().catch(() => null)) as
    | {
        status?: string;
        message?: string;
        data?: { link?: string };
      }
    | null;

  if (!response.ok || body?.status !== "success" || !body.data?.link) {
    throw new Error(body?.message || "Failed to initialize Flutterwave payment session.");
  }

  return {
    provider: input.provider,
    reference: input.reference,
    checkoutUrl: body.data.link,
    amountMinor: input.order.summary.totalMinor,
    currency: input.order.summary.currency,
    mode: "live" as const,
  };
}

export async function createCheckoutSession(input: CheckoutSessionInput) {
  if (resolvePaymentMode() !== "live") {
    return createMockCheckoutSession(input);
  }

  if (input.provider === "paystack") {
    return createPaystackLiveCheckoutSession(input);
  }
  return createFlutterwaveLiveCheckoutSession(input);
}
