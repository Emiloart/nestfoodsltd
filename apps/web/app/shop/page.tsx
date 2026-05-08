import { permanentRedirect } from "next/navigation";

type ShopRedirectPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ShopRedirectPage({ searchParams }: ShopRedirectPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        query.append(key, entry);
      }
    } else if (value) {
      query.set(key, value);
    }
  }

  const queryString = query.toString();
  permanentRedirect(`/products${queryString ? `?${queryString}` : ""}`);
}
