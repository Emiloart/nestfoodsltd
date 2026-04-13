import { unstable_noStore as noStore } from "next/cache";

import { readCommerceData, writeCommerceData } from "./store";
import {
  type CommerceProduct,
  type NutritionItem,
  type ProductAvailabilityStatus,
  type ProductStatus,
  type ProductVariant,
} from "./types";

type ProductFilters = {
  search?: string;
  category?: string;
  allergenExclude?: string;
  tag?: string;
  region?: string;
  inStockOnly?: boolean;
  includeUnavailable?: boolean;
  sort?: "relevance" | "price_asc" | "price_desc";
};

const DEFAULT_PRODUCT_REGIONS = ["Lagos"];
const DEFAULT_MINIMUM_ORDER_QUANTITY = 10;
const DEFAULT_MAXIMUM_ORDER_QUANTITY = 10000;

function normalizeSearchValue(value?: string) {
  return value?.trim().toLowerCase();
}

function normalizeRegionToken(value: string) {
  return value.trim().toLowerCase();
}

function normalizeProductAvailabilityStatus(value: unknown): ProductAvailabilityStatus {
  return value === "limited" || value === "unavailable" ? value : "available";
}

function normalizeRegions(input: unknown) {
  if (!Array.isArray(input)) {
    return [...DEFAULT_PRODUCT_REGIONS];
  }

  const seen = new Set<string>();
  const regions: string[] = [];
  for (const entry of input) {
    if (typeof entry !== "string") {
      continue;
    }
    const normalized = entry.trim();
    if (!normalized) {
      continue;
    }
    const token = normalizeRegionToken(normalized);
    if (seen.has(token)) {
      continue;
    }
    seen.add(token);
    regions.push(normalized);
  }

  if (regions.length === 0) {
    return [...DEFAULT_PRODUCT_REGIONS];
  }
  return regions;
}

function normalizeOrderQuantityRange(
  minInput: unknown,
  maxInput: unknown,
): {
  minimumOrderQuantity: number;
  maximumOrderQuantity: number;
} {
  const minCandidate = Number(minInput);
  const minimumOrderQuantity = Number.isFinite(minCandidate)
    ? Math.max(1, Math.min(1_000_000, Math.round(minCandidate)))
    : DEFAULT_MINIMUM_ORDER_QUANTITY;

  const maxCandidate = Number(maxInput);
  const maximumOrderQuantity = Number.isFinite(maxCandidate)
    ? Math.max(
        minimumOrderQuantity,
        Math.min(1_000_000, Math.round(maxCandidate)),
      )
    : Math.max(minimumOrderQuantity, DEFAULT_MAXIMUM_ORDER_QUANTITY);

  return { minimumOrderQuantity, maximumOrderQuantity };
}

function normalizeCommerceProduct(product: CommerceProduct): CommerceProduct {
  const { minimumOrderQuantity, maximumOrderQuantity } = normalizeOrderQuantityRange(
    product.minimumOrderQuantity,
    product.maximumOrderQuantity,
  );

  return {
    ...product,
    availabilityStatus: normalizeProductAvailabilityStatus(product.availabilityStatus),
    availableRegions: normalizeRegions(product.availableRegions),
    minimumOrderQuantity,
    maximumOrderQuantity,
  };
}

function minimumVariantPrice(product: CommerceProduct) {
  return Math.min(...product.variants.map((variant) => variant.priceMinor));
}

export async function listCommerceProducts(filters?: ProductFilters) {
  noStore();
  const data = await readCommerceData();
  let products = data.products
    .map((product) => normalizeCommerceProduct(product))
    .filter((product) => product.status === "published");

  if (!filters?.includeUnavailable) {
    products = products.filter((product) => product.availabilityStatus !== "unavailable");
  }

  const normalizedSearch = normalizeSearchValue(filters?.search);
  if (normalizedSearch) {
    products = products.filter((product) => {
      const haystack = [
        product.name,
        product.shortDescription,
        product.longDescription,
        product.category,
        product.tags.join(" "),
        product.availableRegions.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }

  if (filters?.category) {
    products = products.filter((product) => product.category === filters.category);
  }

  if (filters?.allergenExclude) {
    const allergen = filters.allergenExclude.toLowerCase();
    products = products.filter((product) =>
      product.allergens.every((entry) => !entry.toLowerCase().includes(allergen)),
    );
  }

  if (filters?.tag) {
    const normalizedTag = filters.tag.toLowerCase();
    products = products.filter((product) =>
      product.tags.some((entry) => entry.toLowerCase() === normalizedTag),
    );
  }

  if (filters?.region) {
    const regionToken = normalizeRegionToken(filters.region);
    products = products.filter((product) =>
      product.availableRegions.some((entry) => normalizeRegionToken(entry) === regionToken),
    );
  }

  if (filters?.inStockOnly) {
    products = products.filter((product) =>
      product.variants.some((variant) => variant.stockStatus !== "out_of_stock"),
    );
  }

  if (filters?.sort === "price_asc") {
    products = [...products].sort((a, b) => minimumVariantPrice(a) - minimumVariantPrice(b));
  }
  if (filters?.sort === "price_desc") {
    products = [...products].sort((a, b) => minimumVariantPrice(b) - minimumVariantPrice(a));
  }

  return products;
}

export async function listCommerceCategories() {
  noStore();
  const products = await listCommerceProducts();
  return [...new Set(products.map((product) => product.category))];
}

export async function listCommerceFacets() {
  noStore();
  const data = await readCommerceData();
  const products = data.products
    .map((product) => normalizeCommerceProduct(product))
    .filter(
      (product) => product.status === "published" && product.availabilityStatus !== "unavailable",
    );
  const categories = [...new Set(products.map((product) => product.category))];
  const allergens = [...new Set(products.flatMap((product) => product.allergens))];
  const tags = [...new Set(products.flatMap((product) => product.tags))];
  const regions = [...new Set(products.flatMap((product) => product.availableRegions))];

  return { categories, allergens, tags, regions };
}

export async function getCommerceProductBySlug(slug: string) {
  noStore();
  const data = await readCommerceData();
  const product = data.products.find((entry) => entry.slug === slug && entry.status === "published");
  if (!product) {
    return null;
  }
  return normalizeCommerceProduct(product);
}

type AdminCreateProductInput = Omit<CommerceProduct, "id" | "updatedAt"> & {
  id?: string;
};

type AdminUpdateProductInput = Partial<Omit<CommerceProduct, "id" | "updatedAt">>;

function buildProductId(slug: string) {
  return `prod-${slug}-${crypto.randomUUID().slice(0, 8)}`;
}

function normalizeVariantId(productSlug: string, variant: ProductVariant, index: number) {
  if (variant.id.trim()) {
    return variant.id.trim();
  }
  const suffix = variant.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `var-${productSlug}-${suffix || index + 1}`;
}

function ensureUniqueProductSlug(products: CommerceProduct[], slug: string, productId?: string) {
  const normalizedSlug = slug.trim().toLowerCase();
  const duplicate = products.find(
    (entry) => entry.slug.toLowerCase() === normalizedSlug && entry.id !== productId,
  );
  if (duplicate) {
    throw new Error("A product with this slug already exists.");
  }
}

function normalizeNutritionTable(input: NutritionItem[]) {
  return input.map((entry) => ({
    label: entry.label.trim(),
    amount: Number(entry.amount),
    unit: entry.unit.trim(),
  }));
}

function normalizeVariants(productSlug: string, input: ProductVariant[]) {
  const seenIds = new Set<string>();
  return input.map((entry, index) => {
    const id = normalizeVariantId(productSlug, entry, index);
    if (seenIds.has(id)) {
      throw new Error(`Duplicate variant id "${id}" in payload.`);
    }
    seenIds.add(id);
    return {
      ...entry,
      id,
      name: entry.name.trim(),
      sku: entry.sku.trim(),
      sizeLabel: entry.sizeLabel?.trim() || undefined,
      priceMinor: Math.round(Number(entry.priceMinor)),
    };
  });
}

function normalizeProductStatus(value: string): ProductStatus {
  return value === "draft" ? "draft" : "published";
}

export async function listAdminCommerceProducts() {
  noStore();
  const data = await readCommerceData();
  return data.products.map((product) => normalizeCommerceProduct(product));
}

export async function getAdminCommerceProductById(productId: string) {
  noStore();
  const data = await readCommerceData();
  const product = data.products.find((entry) => entry.id === productId);
  if (!product) {
    return null;
  }
  return normalizeCommerceProduct(product);
}

export async function createAdminCommerceProduct(input: AdminCreateProductInput) {
  const data = await readCommerceData();
  ensureUniqueProductSlug(data.products, input.slug);

  const productId = input.id?.trim() || buildProductId(input.slug);
  if (data.products.some((entry) => entry.id === productId)) {
    throw new Error("A product with this id already exists.");
  }

  if (input.variants.length === 0) {
    throw new Error("At least one variant is required.");
  }

  const { minimumOrderQuantity, maximumOrderQuantity } = normalizeOrderQuantityRange(
    input.minimumOrderQuantity,
    input.maximumOrderQuantity,
  );
  const now = new Date().toISOString();
  const product: CommerceProduct = {
    id: productId,
    slug: input.slug.trim().toLowerCase(),
    status: normalizeProductStatus(input.status),
    availabilityStatus: normalizeProductAvailabilityStatus(input.availabilityStatus),
    availableRegions: normalizeRegions(input.availableRegions),
    minimumOrderQuantity,
    maximumOrderQuantity,
    name: input.name.trim(),
    category: input.category.trim(),
    shortDescription: input.shortDescription.trim(),
    longDescription: input.longDescription.trim(),
    imageUrl: input.imageUrl.trim(),
    galleryUrls: input.galleryUrls.map((entry) => entry.trim()).filter(Boolean),
    tags: input.tags.map((entry) => entry.trim()).filter(Boolean),
    allergens: input.allergens.map((entry) => entry.trim()).filter(Boolean),
    ingredients: input.ingredients.map((entry) => entry.trim()).filter(Boolean),
    shelfLifeDays: Math.max(1, Math.round(Number(input.shelfLifeDays))),
    nutritionTable: normalizeNutritionTable(input.nutritionTable),
    variants: normalizeVariants(input.slug, input.variants),
    updatedAt: now,
  };

  data.products.unshift(product);
  await writeCommerceData(data);
  return product;
}

export async function updateAdminCommerceProduct(
  productId: string,
  input: AdminUpdateProductInput,
) {
  const data = await readCommerceData();
  const productIndex = data.products.findIndex((entry) => entry.id === productId);
  const existingProduct = data.products[productIndex];
  if (!existingProduct) {
    throw new Error("Product not found.");
  }
  const product = normalizeCommerceProduct(existingProduct);

  const nextSlug = input.slug ? input.slug.trim().toLowerCase() : product.slug;
  ensureUniqueProductSlug(data.products, nextSlug, productId);

  if (input.variants && input.variants.length === 0) {
    throw new Error("At least one variant is required.");
  }

  product.slug = nextSlug;
  if (input.status) {
    product.status = normalizeProductStatus(input.status);
  }
  if (input.availabilityStatus !== undefined) {
    product.availabilityStatus = normalizeProductAvailabilityStatus(input.availabilityStatus);
  }
  if (input.availableRegions !== undefined) {
    product.availableRegions = normalizeRegions(input.availableRegions);
  }
  if (input.name !== undefined) {
    product.name = input.name.trim();
  }
  if (input.category !== undefined) {
    product.category = input.category.trim();
  }
  if (input.shortDescription !== undefined) {
    product.shortDescription = input.shortDescription.trim();
  }
  if (input.longDescription !== undefined) {
    product.longDescription = input.longDescription.trim();
  }
  if (input.imageUrl !== undefined) {
    product.imageUrl = input.imageUrl.trim();
  }
  if (input.galleryUrls) {
    product.galleryUrls = input.galleryUrls.map((entry) => entry.trim()).filter(Boolean);
  }
  if (input.tags) {
    product.tags = input.tags.map((entry) => entry.trim()).filter(Boolean);
  }
  if (input.allergens) {
    product.allergens = input.allergens.map((entry) => entry.trim()).filter(Boolean);
  }
  if (input.ingredients) {
    product.ingredients = input.ingredients.map((entry) => entry.trim()).filter(Boolean);
  }
  if (input.shelfLifeDays !== undefined) {
    product.shelfLifeDays = Math.max(1, Math.round(Number(input.shelfLifeDays)));
  }
  if (input.nutritionTable) {
    product.nutritionTable = normalizeNutritionTable(input.nutritionTable);
  }
  if (input.variants) {
    product.variants = normalizeVariants(nextSlug, input.variants);
  }
  const { minimumOrderQuantity, maximumOrderQuantity } = normalizeOrderQuantityRange(
    input.minimumOrderQuantity ?? product.minimumOrderQuantity,
    input.maximumOrderQuantity ?? product.maximumOrderQuantity,
  );
  product.minimumOrderQuantity = minimumOrderQuantity;
  product.maximumOrderQuantity = maximumOrderQuantity;
  product.updatedAt = new Date().toISOString();
  data.products[productIndex] = product;

  await writeCommerceData(data);
  return product;
}

export async function deleteAdminCommerceProduct(productId: string) {
  const data = await readCommerceData();
  const productIndex = data.products.findIndex((entry) => entry.id === productId);
  if (productIndex < 0) {
    throw new Error("Product not found.");
  }

  const product = data.products[productIndex];
  if (!product) {
    throw new Error("Product not found.");
  }
  const deleted = data.products.splice(productIndex, 1)[0];
  if (!deleted) {
    throw new Error("Product not found.");
  }
  await writeCommerceData(data);
  return deleted;
}
