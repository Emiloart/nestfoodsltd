export type CurrencyCode = "NGN" | "USD";

export type ProductStatus = "draft" | "published";
export type ProductAvailabilityStatus = "available" | "limited" | "unavailable";

export type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  sizeLabel?: string;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  priceMinor: number;
  currency: CurrencyCode;
};

export type NutritionItem = {
  label: string;
  amount: number;
  unit: string;
};

export type CommerceProduct = {
  id: string;
  slug: string;
  status: ProductStatus;
  availabilityStatus: ProductAvailabilityStatus;
  availableRegions: string[];
  minimumOrderQuantity: number;
  maximumOrderQuantity: number;
  name: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  imageUrl: string;
  galleryUrls: string[];
  tags: string[];
  allergens: string[];
  ingredients: string[];
  shelfLifeDays: number;
  nutritionTable: NutritionItem[];
  variants: ProductVariant[];
  updatedAt: string;
};

export type CommerceData = {
  products: CommerceProduct[];
};
