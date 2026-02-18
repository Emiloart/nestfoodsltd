import { type NextRequest } from "next/server";

import { createSignedSessionToken, verifySignedSessionToken } from "@/lib/security/session-token";

import { B2B_SESSION_COOKIE_NAME } from "./service";

const B2B_SESSION_TOKEN_TYPE = "b2b";

export function createB2BSessionToken(accountId: string) {
  return createSignedSessionToken(
    {
      type: B2B_SESSION_TOKEN_TYPE,
      sub: accountId.trim(),
    },
    { ttlSeconds: 60 * 60 * 24 * 30 },
  );
}

export function getB2BSessionAccountId(request: NextRequest) {
  const value = request.cookies.get(B2B_SESSION_COOKIE_NAME)?.value ?? "";
  const parsed = verifySignedSessionToken(value, B2B_SESSION_TOKEN_TYPE);
  if (parsed?.sub) {
    return parsed.sub.trim() || null;
  }

  return value.trim() || null;
}
