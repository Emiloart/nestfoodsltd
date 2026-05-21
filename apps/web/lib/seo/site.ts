const PRODUCTION_SITE_URL = "https://nestfoodsltd.com";
const NON_CANONICAL_SITE_HOSTS = new Set(["nestfoodsltd-web.vercel.app", "www.nestfoodsltd.com"]);

function ensureLeadingSlash(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function resolveSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) {
    return PRODUCTION_SITE_URL;
  }

  try {
    const url = new URL(configured);
    if (NON_CANONICAL_SITE_HOSTS.has(url.host.toLowerCase())) {
      return PRODUCTION_SITE_URL;
    }
    return url.origin;
  } catch {
    return PRODUCTION_SITE_URL;
  }
}

export function absoluteUrl(path = "/") {
  return new URL(ensureLeadingSlash(path), resolveSiteUrl()).toString();
}
