export type CatalogueProductStatus = "draft" | "published";

export type CataloguePackFormat = {
  id: string;
  label: string;
};

export type CatalogueNutritionNote = {
  label: string;
  value: string;
};

export type CatalogueGalleryImage = {
  url: string;
  altText: string;
  label?: string;
};

export type CatalogueProduct = {
  id: string;
  slug: string;
  status: CatalogueProductStatus;
  name: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  imageUrl: string;
  galleryUrls: string[];
  galleryImages?: CatalogueGalleryImage[];
  ingredients: string[];
  allergens: string[];
  nutritionNotes: CatalogueNutritionNote[];
  nutrition?: CatalogueNutritionNote[];
  packFormats: CataloguePackFormat[];
  bestFor: string[];
  shelfLife?: string;
  storageInstructions?: string[];
  updatedAt: string;
};

export type CatalogueData = {
  products: CatalogueProduct[];
};
