import { type CatalogueProduct } from "@/lib/catalog/types";
import { absoluteUrl } from "@/lib/seo/site";

type ArticleStructuredDataInput = {
  headline: string;
  description: string;
  path: string;
  imageUrl?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
};

type FaqEntry = {
  question: string;
  answer: string;
};

function resolveImageUrl(imageUrl?: string) {
  return absoluteUrl(imageUrl ?? "/media/hero/nestfoodsltd-desktop-hero-banner.jpg");
}

export function buildOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Nest Foods Limited",
    alternateName: "De-Nest Bread",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/brand/logos/logo-primary.png"),
    sameAs: [],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "general enquiries",
        areaServed: "NG",
        availableLanguage: ["English"],
      },
    ],
  };
}

export function buildProductStructuredData(product: CatalogueProduct) {
  const nutritionSource =
    product.nutrition && product.nutrition.length > 0 ? product.nutrition : product.nutritionNotes;
  const nutrition = nutritionSource.filter(
    (entry) => !/to be confirmed/i.test(entry.value),
  );
  const productProperties = [
    ...nutrition,
    ...(product.shelfLife ? [{ label: "Freshness", value: product.shelfLife }] : []),
    ...(product.storageInstructions ?? []).map((item, index) => ({
      label: `Storage ${index + 1}`,
      value: item,
    })),
    ...product.bestFor.map((item, index) => ({
      label: `Best for ${index + 1}`,
      value: item,
    })),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.longDescription,
    image: [product.imageUrl, ...product.galleryUrls].map((entry) => resolveImageUrl(entry)),
    category: product.category,
    brand: {
      "@type": "Brand",
      name: "De-Nest Bread",
    },
    additionalProperty: productProperties.map((entry) => ({
      "@type": "PropertyValue",
      name: entry.label,
      value: entry.value,
    })),
  };
}

export function buildArticleStructuredData(input: ArticleStructuredDataInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: absoluteUrl(input.path),
    headline: input.headline,
    description: input.description,
    image: [resolveImageUrl(input.imageUrl)],
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: {
      "@type": "Organization",
      name: input.authorName ?? "Nest Foods Limited",
    },
    publisher: {
      "@type": "Organization",
      name: "Nest Foods Limited",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/brand/logos/logo-primary.png"),
      },
    },
  };
}

export function buildFaqStructuredData(entries: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}
