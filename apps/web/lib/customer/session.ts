import { type NextRequest } from "next/server";

import { createSignedSessionToken, verifySignedSessionToken } from "@/lib/security/session-token";

import { CUSTOMER_SESSION_COOKIE_NAME } from "./service";

const CUSTOMER_SESSION_TOKEN_TYPE = "customer";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function createCustomerSessionToken(email: string) {
  return createSignedSessionToken(
    {
      type: CUSTOMER_SESSION_TOKEN_TYPE,
      sub: normalizeEmail(email),
    },
    { ttlSeconds: 60 * 60 * 24 * 30 },
  );
}

export function getCustomerSessionEmail(request: NextRequest) {
  const value = request.cookies.get(CUSTOMER_SESSION_COOKIE_NAME)?.value ?? "";
  const parsed = verifySignedSessionToken(value, CUSTOMER_SESSION_TOKEN_TYPE);
  if (parsed?.sub) {
    return normalizeEmail(parsed.sub);
  }

  return normalizeEmail(value) || null;
}
