import { type NextRequest } from "next/server";

const DEFAULT_ADMIN_HOSTS = [
  "admin.localhost:3000",
  "admin.nestfoodsltd.com",
  "nestfoodsltd-web.vercel.app",
];

function normalizeHost(value?: string | null) {
  if (!value?.trim()) {
    return null;
  }

  try {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return new URL(value).host.toLowerCase();
    }
    return value.toLowerCase();
  } catch {
    return null;
  }
}

function resolveConfiguredAdminHosts() {
  const configuredHosts = [
    ...DEFAULT_ADMIN_HOSTS,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL,
    ...(process.env.ADMIN_APP_HOSTS ?? "").split(","),
  ]
    .map((host) => normalizeHost(host))
    .filter((host): host is string => Boolean(host));

  return new Set(configuredHosts);
}

function resolveRequestHost(request: NextRequest) {
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")
    .map((entry) => entry.trim())
    .find(Boolean);

  return normalizeHost(forwardedHost ?? request.headers.get("host"));
}

export function isAdminHost(request: NextRequest) {
  const requestHost = resolveRequestHost(request);
  if (!requestHost) {
    return false;
  }
  return resolveConfiguredAdminHosts().has(requestHost);
}

export function isAdminSurfacePath(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/cms")
  );
}
