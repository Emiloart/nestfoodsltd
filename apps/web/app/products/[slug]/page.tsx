import { ImagePlaceholder } from "@/components/image-placeholder";
import { PageShell } from "@/components/page-shell";

type ProductDetailPageProps = {
  params: { slug: string };
};

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return (
    <>
      <PageShell
        title={`Product: ${params.slug}`}
        description="Product detail scaffold with space for nutrition facts, ingredients, allergens, and reviews."
        nextStep="Bind to product domain model"
      />
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-6">
        <ImagePlaceholder
          src="/placeholders/product-image-placeholder.svg"
          alt="Product image placeholder"
          label="Product Image Placeholder"
          className="aspect-square max-w-xl"
        />
      </section>
    </>
  );
}
