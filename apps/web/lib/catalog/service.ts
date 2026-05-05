import { unstable_noStore as noStore } from "next/cache";

import { readCatalogueData, writeCatalogueData } from "./store";
import {
  type CatalogueNutritionNote,
  type CataloguePackFormat,
  type CatalogueProduct,
  type CatalogueProductStatus,
} from "./types";

type ProductFilters = {
  search?: string;
  category?: string;
  allergenExclude?: string;
  includeDraft?: boolean;
};

type AdminCreateProductInput = Omit<CatalogueProduct, "id" | "updatedAt"> & {
  id?: string;
};

type AdminUpdateProductInput = Partial<Omit<CatalogueProduct, "id" | "updatedAt">>;

function normalizeSearchValue(value?: string) {
  return value?.trim().toLowerCase();
}

function normalizeProductStatus(value: string): CatalogueProductStatus {
  return value === "draft" ? "draft" : "published";
}

function buildProductId(slug: string) {
  return `catalogue-${slug}-${crypto.randomUUID().slice(0, 8)}`;
}

function normalizeSlug(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureUniqueProductSlug(products: CatalogueProduct[], slug: string, productId?: string) {
  const normalizedSlug = normalizeSlug(slug);
  const duplicate = products.find(
    (entry) => entry.slug.toLowerCase() === normalizedSlug && entry.id !== productId,
  );
  if (duplicate) {
    throw new Error("A product with this slug already exists.");
  }
}

function normalizeTextList(input: string[] | undefined) {
  if (!Array.isArray(input)) {
    return [];
  }

  const seen = new Set<string>();
  const values: string[] = [];
  for (const entry of input) {
    const value = entry.trim();
    if (!value) {
      continue;
    }
    const token = value.toLowerCase();
    if (seen.has(token)) {
      continue;
    }
    seen.add(token);
    values.push(value);
  }
  return values;
}

function normalizePackFormatId(productSlug: string, format: CataloguePackFormat, index: number) {
  if (format.id.trim()) {
    return normalizeSlug(format.id);
  }
  const suffix = normalizeSlug(format.label);
  return `${productSlug}-${suffix || index + 1}`;
}

function normalizePackFormats(productSlug: string, input: CataloguePackFormat[]) {
  if (input.length === 0) {
    throw new Error("At least one pack or size format is required.");
  }

  const seenIds = new Set<string>();
  return input.map((entry, index) => {
    const id = normalizePackFormatId(productSlug, entry, index);
    if (seenIds.has(id)) {
      throw new Error(`Duplicate pack format id "${id}" in payload.`);
    }
    seenIds.add(id);
    return {
      id,
      label: entry.label.trim(),
      sku: entry.sku?.trim() || undefined,
    };
  });
}

function normalizeNutritionNotes(input: CatalogueNutritionNote[] | undefined) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((entry) => ({
      label: entry.label.trim(),
      value: entry.value.trim(),
    }))
    .filter((entry) => entry.label && entry.value);
}

function normalizeCatalogueProduct(product: CatalogueProduct): CatalogueProduct {
  return {
    ...product,
    slug: normalizeSlug(product.slug),
    status: normalizeProductStatus(product.status),
    name: product.name.trim(),
    category: product.category.trim(),
    shortDescription: product.shortDescription.trim(),
    longDescription: product.longDescription.trim(),
    imageUrl: product.imageUrl.trim(),
    galleryUrls: normalizeTextList(product.galleryUrls),
    ingredients: normalizeTextList(product.ingredients),
    allergens: normalizeTextList(product.allergens),
    nutritionNotes: normalizeNutritionNotes(product.nutritionNotes),
    packFormats: normalizePackFormats(normalizeSlug(product.slug), product.packFormats),
  };
}

export async function listCatalogueProducts(filters?: ProductFilters) {
  noStore();
  const data = await readCatalogueData();
  let products = data.products
    .map((product) => normalizeCatalogueProduct(product))
    .filter((product) => filters?.includeDraft || product.status === "published");

  const normalizedSearch = normalizeSearchValue(filters?.search);
  if (normalizedSearch) {
    products = products.filter((product) => {
      const haystack = [
        product.name,
        product.shortDescription,
        product.longDescription,
        product.category,
        product.ingredients.join(" "),
        product.allergens.join(" "),
        product.packFormats.map((format) => format.label).join(" "),
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

  return products;
}

export async function listCatalogueFacets() {
  noStore();
  const products = await listCatalogueProducts();
  const categories = [...new Set(products.map((product) => product.category))];
  const allergens = [...new Set(products.flatMap((product) => product.allergens))];

  return { categories, allergens };
}

export async function getCatalogueProductBySlug(slug: string) {
  noStore();
  const data = await readCatalogueData();
  const normalizedSlug = normalizeSlug(slug);
  const product = data.products.find(
    (entry) => entry.slug === normalizedSlug && entry.status === "published",
  );
  if (!product) {
    return null;
  }
  return normalizeCatalogueProduct(product);
}

export async function listAdminCatalogueProducts() {
  noStore();
  const data = await readCatalogueData();
  return data.products.map((product) => normalizeCatalogueProduct(product));
}

export async function getAdminCatalogueProductById(productId: string) {
  noStore();
  const data = await readCatalogueData();
  const product = data.products.find((entry) => entry.id === productId);
  if (!product) {
    return null;
  }
  return normalizeCatalogueProduct(product);
}

export async function createAdminCatalogueProduct(input: AdminCreateProductInput) {
  const data = await readCatalogueData();
  const slug = normalizeSlug(input.slug);
  ensureUniqueProductSlug(data.products, slug);

  const productId = input.id?.trim() || buildProductId(slug);
  if (data.products.some((entry) => entry.id === productId)) {
    throw new Error("A product with this id already exists.");
  }

  const now = new Date().toISOString();
  const product = normalizeCatalogueProduct({
    id: productId,
    slug,
    status: normalizeProductStatus(input.status),
    name: input.name,
    category: input.category,
    shortDescription: input.shortDescription,
    longDescription: input.longDescription,
    imageUrl: input.imageUrl,
    galleryUrls: input.galleryUrls,
    ingredients: input.ingredients,
    allergens: input.allergens,
    nutritionNotes: input.nutritionNotes,
    packFormats: input.packFormats,
    updatedAt: now,
  });

  data.products.unshift(product);
  await writeCatalogueData(data);
  return product;
}

export async function updateAdminCatalogueProduct(
  productId: string,
  input: AdminUpdateProductInput,
) {
  const data = await readCatalogueData();
  const productIndex = data.products.findIndex((entry) => entry.id === productId);
  const existingProduct = data.products[productIndex];
  if (!existingProduct) {
    throw new Error("Product not found.");
  }

  const product = normalizeCatalogueProduct(existingProduct);
  const nextSlug = input.slug ? normalizeSlug(input.slug) : product.slug;
  ensureUniqueProductSlug(data.products, nextSlug, productId);

  const nextProduct = normalizeCatalogueProduct({
    ...product,
    ...input,
    slug: nextSlug,
    status: input.status ? normalizeProductStatus(input.status) : product.status,
    updatedAt: new Date().toISOString(),
  });

  data.products[productIndex] = nextProduct;
  await writeCatalogueData(data);
  return nextProduct;
}

export async function deleteAdminCatalogueProduct(productId: string) {
  const data = await readCatalogueData();
  const productIndex = data.products.findIndex((entry) => entry.id === productId);
  if (productIndex < 0) {
    throw new Error("Product not found.");
  }

  const deleted = data.products.splice(productIndex, 1)[0];
  if (!deleted) {
    throw new Error("Product not found.");
  }
  await writeCatalogueData(data);
  return deleted;
}
