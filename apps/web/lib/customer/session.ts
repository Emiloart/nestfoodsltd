import { type NextRequest } from "next/server";

import { CUSTOMER_SESSION_COOKIE_NAME } from "./service";

export function getCustomerSessionEmail(request: NextRequest) {
  const value = request.cookies.get(CUSTOMER_SESSION_COOKIE_NAME)?.value ?? "";
  return value.trim().toLowerCase() || null;
}
