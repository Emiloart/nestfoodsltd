import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  ADMIN_SESSION_COOKIE_NAME,
  getAdminPermissions,
  resolveAdminRoleFromRequest,
  resolveAdminRoleFromToken,
} from "@/lib/admin/auth";

const loginSchema = z.object({
  token: z.string().trim().min(8),
});

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  };
}

export async function GET(request: NextRequest) {
  const role = resolveAdminRoleFromRequest(request);
  if (!role) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    role,
    permissions: getAdminPermissions(role),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const validated = loginSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: "Invalid login payload" }, { status: 400 });
  }

  const role = resolveAdminRoleFromToken(validated.data.token);
  if (!role) {
    return NextResponse.json({ error: "Invalid admin token" }, { status: 401 });
  }

  const response = NextResponse.json({
    authenticated: true,
    role,
    permissions: getAdminPermissions(role),
  });

  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, validated.data.token, cookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
  return response;
}
