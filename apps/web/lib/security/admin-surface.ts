import { type NextRequest } from "next/server";

const DEFAULT_ADMIN_HOSTS = ["admin.localhost:3000", "admin.nestfoodsltd.com"];

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
  const configuredHosts = (process.env.ADMIN_APP_HOSTS ?? "")
    .split(",")
    .map((host) => normalizeHost(host.trim()))
    .filter((host): host is string => Boolean(host));

  if (configuredHosts.length > 0) {
    return new Set(configuredHosts);
  }

  return new Set(DEFAULT_ADMIN_HOSTS);
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
    pathname.startsWith("/api/cms") ||
    pathname.startsWith("/api/b2b/admin")
  );
}
