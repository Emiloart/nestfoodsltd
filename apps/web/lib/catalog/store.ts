import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { resolveJsonDataFilePath } from "@/lib/storage/json-file";
import { readPostgresJsonStore, writePostgresJsonStore } from "@/lib/storage/postgres-json";

import { CATALOGUE_SEED_DATA } from "./seed";
import { type CatalogueData } from "./types";

const relativeDataFilePath = path.join("data", "catalog.json");
const dataFilePath = resolveJsonDataFilePath(relativeDataFilePath);
const storageDriver = process.env.CATALOG_STORAGE_DRIVER ?? "json";
const postgresModuleKey = "catalog";
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

function normalizeCurrentCatalogueProducts(products: CatalogueData["products"]) {
  return products.map((product) => {
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

function mergeCatalogueData(input: Partial<CatalogueData> | null | undefined): CatalogueData {
  if (!input) {
    return structuredClone(CATALOGUE_SEED_DATA);
  }

  return {
    products: normalizeCurrentCatalogueProducts(input.products ?? CATALOGUE_SEED_DATA.products),
  };
}

export async function readCatalogueData(): Promise<CatalogueData> {
  if (storageDriver === "postgres") {
    const payload = await readPostgresJsonStore<Partial<CatalogueData>>(
      postgresModuleKey,
      CATALOGUE_SEED_DATA,
    );
    return mergeCatalogueData(payload);
  }

  if (storageDriver !== "json") {
    throw new Error("CATALOG_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.");
  }

  try {
    const raw = await readFile(dataFilePath, "utf8");
    return mergeCatalogueData(JSON.parse(raw) as Partial<CatalogueData>);
  } catch {
    await writeCatalogueData(CATALOGUE_SEED_DATA);
    return CATALOGUE_SEED_DATA;
  }
}

export async function writeCatalogueData(data: CatalogueData) {
  if (storageDriver === "postgres") {
    await writePostgresJsonStore(postgresModuleKey, data);
    return;
  }

  if (storageDriver !== "json") {
    throw new Error("CATALOG_STORAGE_DRIVER is not implemented for runtime yet. Use json for now.");
  }

  await mkdir(path.dirname(dataFilePath), { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
