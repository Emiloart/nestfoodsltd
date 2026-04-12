import { type CommerceProduct } from "@/lib/commerce/types";
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
  return absoluteUrl(imageUrl ?? "/placeholders/section-image-placeholder.svg");
}

export function buildOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Nest Foods Ltd",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/placeholders/logo-placeholder.svg"),
    sameAs: ["https://web.facebook.com/nest.foods.2025"],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        areaServed: "NG",
        availableLanguage: ["English"],
      },
    ],
  };
}

export function buildProductStructuredData(product: CommerceProduct) {
  const defaultSku = product.variants[0]?.sku ?? product.id;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.longDescription,
    image: [product.imageUrl, ...product.galleryUrls].map((entry) => resolveImageUrl(entry)),
    sku: defaultSku,
    category: product.category,
    brand: {
      "@type": "Brand",
      name: "Nest Foods Ltd",
    },
    additionalProperty: product.nutritionTable.map((entry) => ({
      "@type": "PropertyValue",
      name: entry.label,
      value: `${entry.amount}${entry.unit}`,
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
      name: input.authorName ?? "Nest Foods Editorial Team",
    },
    publisher: {
      "@type": "Organization",
      name: "Nest Foods Ltd",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/placeholders/logo-placeholder.svg"),
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
