import { type NextRequest } from "next/server";

import { B2B_SESSION_COOKIE_NAME } from "./service";

export function getB2BSessionAccountId(request: NextRequest) {
  const value = request.cookies.get(B2B_SESSION_COOKIE_NAME)?.value ?? "";
  return value.trim() || null;
}
