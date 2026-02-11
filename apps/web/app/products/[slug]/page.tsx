import { PageShell } from "@/components/page-shell";

type ProductDetailPageProps = {
  params: { slug: string };
};

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return (
    <PageShell
      title={`Product: ${params.slug}`}
      description="Product detail scaffold with space for nutrition facts, ingredients, allergens, and reviews."
      nextStep="Bind to product domain model"
    />
  );
}
