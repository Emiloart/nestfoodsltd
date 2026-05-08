import { Badge } from "@/components/ui/badge";
import { ProductsCatalogueClient } from "@/components/products/products-catalogue-client";
import { listCatalogueProducts } from "@/lib/catalog/service";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Products",
  description:
    "Browse De-Nest Bread products with ingredients, allergens, sizes, and enquiry-ready product information.",
  path: "/products",
});

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const search = params.search?.trim() || undefined;
  const category = params.category?.trim() || undefined;

  const products = await listCatalogueProducts();

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 md:space-y-8 md:px-6 md:py-16">
      <div className="space-y-3">
        <Badge>Product Range</Badge>
        <h1 className="display-heading text-4xl text-neutral-900 sm:text-[3.15rem]">
          De-Nest Bread Product Catalogue
        </h1>
      </div>

      <ProductsCatalogueClient
        products={products}
        initialCategory={category}
        initialSearch={search}
      />
    </section>
  );
}
