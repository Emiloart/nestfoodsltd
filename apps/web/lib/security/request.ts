import { type NextRequest } from "next/server";

export function resolveClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor
      .split(",")
      .map((entry: string) => entry.trim())
      .find(Boolean);
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "0.0.0.0";
}

export function resolveUserAgent(request: NextRequest) {
  return request.headers.get("user-agent")?.trim() || "unknown";
}

function resolveRequestHost(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-host")?.trim() ||
    request.headers.get("host")?.trim() ||
    undefined
  );
}

function normalizeHost(input?: string | null) {
  if (!input?.trim()) {
    return null;
  }

  try {
    if (input.startsWith("http://") || input.startsWith("https://")) {
      return new URL(input).host.toLowerCase();
    }
    return input.toLowerCase();
  } catch {
    return null;
  }
}

export function isTrustedOrigin(request: NextRequest) {
  const originHeader = request.headers.get("origin");
  if (!originHeader) {
    return true;
  }

  let originHost: string | null = null;
  try {
    originHost = new URL(originHeader).host.toLowerCase();
  } catch {
    return false;
  }

  const allowedHosts = new Set<string>();

  const requestHost = normalizeHost(resolveRequestHost(request));
  if (requestHost) {
    allowedHosts.add(requestHost);
  }

  const configuredHost = normalizeHost(process.env.NEXT_PUBLIC_SITE_URL);
  if (configuredHost) {
    allowedHosts.add(configuredHost);
  }

  return allowedHosts.has(originHost);
}
