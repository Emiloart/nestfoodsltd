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
  return absoluteUrl(imageUrl ?? "/seo/og/default-og.svg");
}

export function buildOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Nest Foods Limited",
    alternateName: "De-Nest Bread",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/brand/logos/logo-primary.svg"),
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
    additionalProperty: product.nutritionNotes.map((entry) => ({
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
        url: absoluteUrl("/brand/logos/logo-primary.svg"),
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
