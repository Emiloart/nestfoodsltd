import { NextRequest, NextResponse } from "next/server";

import { isAdminHost, isAdminSurfacePath } from "./lib/security/admin-surface";

const ADMIN_SESSION_COOKIE_NAME = "nest_admin_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isAdminSurfacePath(pathname)) {
    return NextResponse.next();
  }

  if (!isAdminHost(request)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const tokenFromCookie = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const tokenFromHeader = request.headers.get("x-admin-token");
  if ((tokenFromHeader ?? tokenFromCookie)?.trim()) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/admin/login";
  redirectUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/cms/:path*", "/api/b2b/admin/:path*"],
};
