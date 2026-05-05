export type CatalogueProductStatus = "draft" | "published";

export type CataloguePackFormat = {
  id: string;
  label: string;
  sku?: string;
};

export type CatalogueNutritionNote = {
  label: string;
  value: string;
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
  ingredients: string[];
  allergens: string[];
  nutritionNotes: CatalogueNutritionNote[];
  packFormats: CataloguePackFormat[];
  updatedAt: string;
};

export type CatalogueData = {
  products: CatalogueProduct[];
};
