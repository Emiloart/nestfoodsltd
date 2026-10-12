import { type CatalogueData } from "./types";

// Keep the approved product artwork and Mini launch status when reading legacy catalogue data.
const jumboImageUrls = [
  "/media/products/de-nest-family-jumbo-bread-packaged.jpg",
  "/media/products/de-nest-family-jumbo-bread-with-slices.png",
  "/media/products/nestfoodsltd-unpacked-loaf.png",
];
const miniComingSoonImageUrl = "/placeholders/products/mini-bread-coming-soon.svg";
const midiImageUrls = [
  "/media/products/nestfoodsltd-midi-loaf.png",
  "/media/products/nestfoodsltd-midi-loaf-texture.png",
  "/media/products/nestfoodsltd-midi-loaf-unpacked.png",
];

function withComingSoon(value: string) {
  return /coming soon/i.test(value) ? value : `${value.trim()} Coming soon.`;
}

export function normalizeCurrentCatalogueProducts(products: CatalogueData["products"]) {
  return products.map<CatalogueData["products"][number]>((product) => {
    if (
      product.slug === "de-nest-family-jumbo-bread" ||
      product.id === "catalogue-de-nest-family-jumbo-bread"
    ) {
      return {
        ...product,
        imageUrl: jumboImageUrls[0]!,
        galleryUrls: jumboImageUrls,
        galleryImages: [
          {
            url: jumboImageUrls[0]!,
            altText: "De-Nest Family Jumbo Bread product view",
            label: "Packaged jumbo loaf",
          },
          {
            url: jumboImageUrls[1]!,
            altText: "De-Nest Family Jumbo Bread loaf with slices view",
            label: "Jumbo loaf with slices",
          },
          {
            url: jumboImageUrls[2]!,
            altText: "Unpacked De-Nest family loaf texture view",
            label: "Unpacked loaf",
          },
        ],
      };
    }

    if (product.slug === "de-nest-mini-bread" || product.id === "catalogue-de-nest-mini-bread") {
      return {
        ...product,
        availability: product.availability ?? "coming-soon",
        shortDescription: withComingSoon(product.shortDescription),
        longDescription: withComingSoon(product.longDescription),
        imageUrl: miniComingSoonImageUrl,
        galleryUrls: [miniComingSoonImageUrl],
        galleryImages: [
          {
            url: miniComingSoonImageUrl,
            altText: "De-Nest Mini Bread coming soon image placeholder",
            label: "Mini bread coming soon",
          },
        ],
      };
    }

    if (product.slug === "de-nest-midi-bread" || product.id === "catalogue-de-nest-midi-bread") {
      return {
        ...product,
        imageUrl: midiImageUrls[0]!,
        galleryUrls: midiImageUrls,
        galleryImages: [
          {
            url: midiImageUrls[0]!,
            altText: "De-Nest Midi Bread product view",
            label: "Packaged midi loaf",
          },
          {
            url: midiImageUrls[1]!,
            altText: "De-Nest Midi Bread loaf and texture view",
            label: "Midi loaf texture",
          },
          {
            url: midiImageUrls[2]!,
            altText: "Unpacked De-Nest Midi Bread view",
            label: "Unpacked midi loaf",
          },
        ],
      };
    }

    return product;
  });
}
