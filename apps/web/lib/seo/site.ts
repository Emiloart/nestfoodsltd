const PRODUCTION_SITE_URL = "https://nestfoodsltd.com";

function ensureLeadingSlash(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function resolveSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) {
    return PRODUCTION_SITE_URL;
  }

  try {
    return new URL(configured).origin;
  } catch {
    return PRODUCTION_SITE_URL;
  }
}

export function absoluteUrl(path = "/") {
  return new URL(ensureLeadingSlash(path), resolveSiteUrl()).toString();
}
