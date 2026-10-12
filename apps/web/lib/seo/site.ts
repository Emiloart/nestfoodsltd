const PRODUCTION_SITE_URL = "https://www.nestfoodsltd.com";
const NON_CANONICAL_SITE_HOSTS = new Set(["nestfoodsltd-web.vercel.app", "nestfoodsltd.com"]);

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
  return new URL(path || "/", resolveSiteUrl()).toString();
}

export function publicImageUrl(source?: string) {
  return absoluteUrl(
    source && /^(\/|https?:\/\/)/i.test(source)
      ? source
      : "/media/hero/nestfoodsltd-desktop-hero-banner2.png",
  );
}
