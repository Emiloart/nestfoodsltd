import { createHmac, timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { handlePaymentWebhook } from "@/lib/commerce/service";

function verifyPaystackSignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
  if (!secret) {
    return true;
  }
  if (!signature) {
    return false;
  }

  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

function verifyFlutterwaveSignature(signature: string | null) {
  const secretHash = process.env.FLW_WEBHOOK_SECRET_HASH;
  if (!secretHash) {
    return true;
  }
  if (!signature) {
    return false;
  }
  return signature === secretHash;
}

type RouteContext = {
  params: Promise<{ provider: string }> | { provider: string };
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { provider } = await Promise.resolve(context.params);
  if (provider !== "paystack" && provider !== "flutterwave") {
    return NextResponse.json({ error: "Unknown provider." }, { status: 400 });
  }

  const rawBody = await request.text();
  const payload = ((() => {
    try {
      return JSON.parse(rawBody || "{}") as Record<string, unknown>;
    } catch {
      return {};
    }
  })()) as Record<string, unknown>;
  const reference = String(
    payload.reference ??
      payload.tx_ref ??
      (typeof payload.data === "object" && payload.data ? (payload.data as { reference?: unknown }).reference : ""),
  );
  const eventName = String(payload.event ?? payload.status ?? payload.type ?? "unknown");

  const isSignatureValid =
    provider === "paystack"
      ? verifyPaystackSignature(rawBody, request.headers.get("x-paystack-signature"))
      : verifyFlutterwaveSignature(request.headers.get("verif-hash"));

  if (!isSignatureValid) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  const result = await handlePaymentWebhook({
    provider,
    event: eventName,
    reference,
    payload,
  });

  return NextResponse.json(result, { status: result.success ? 200 : 202 });
}
