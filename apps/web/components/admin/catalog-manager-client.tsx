"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  type CatalogueGalleryImage,
  type CatalogueNutritionNote,
  type CataloguePackFormat,
  type CatalogueProduct,
  type CatalogueProductStatus,
} from "@/lib/catalog/types";

type CatalogProductsResponse = {
  role: string;
  products: CatalogueProduct[];
};

type CatalogProductResponse = {
  role: string;
  product: CatalogueProduct;
};

type CatalogFormState = {
  slug: string;
  status: CatalogueProductStatus;
  name: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  imageUrl: string;
  galleryUrlsText: string;
  galleryImagesText: string;
  allergensText: string;
  ingredientsText: string;
  nutritionNotesText: string;
  bestForText: string;
  shelfLife: string;
  storageInstructionsText: string;
  packFormatsText: string;
};

const emptyFormState: CatalogFormState = {
  slug: "",
  status: "draft",
  name: "",
  category: "",
  shortDescription: "",
  longDescription: "",
  imageUrl: "/placeholders/products/product-placeholder.svg",
  galleryUrlsText: "/placeholders/products/product-placeholder.svg",
  galleryImagesText:
    "/placeholders/products/product-placeholder.svg | De-Nest Bread product view | Product view",
  allergensText: "Contains wheat (gluten)\nContains milk\nMay contain traces of soya",
  ingredientsText: "Enriched wheat flour\nWater\nSugar\nVegetable oil\nYeast\nSalt\nMilk\nButter",
  nutritionNotesText:
    "Energy | To be confirmed per 100g\nCarbohydrates | To be confirmed per 100g\nProtein | To be confirmed per 100g\nFat | To be confirmed per 100g\nSugar | To be confirmed per 100g\nSodium | To be confirmed per 100g",
  bestForText: "Family meals\nSchool lunch\nTea-time serving",
  shelfLife: "9-10 days freshness when stored as directed.",
  storageInstructionsText:
    "Store in a cool, dry place away from direct sunlight.\nKeep sealed after opening.\nUse before the date printed on the pack.",
  packFormatsText: "default | Standard loaf",
};

const maxProductImageUploadBytes = 1_500_000;

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Could not read selected image."));
    });
    reader.addEventListener("error", () => reject(new Error("Could not read selected image.")));
    reader.readAsDataURL(file);
  });
}

function parseLines(text: string) {
  return text
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseDelimitedLine(line: string) {
  return line.split("|").map((entry) => entry.trim());
}

function toTextList(items: string[]) {
  return items.join("\n");
}

function parseNutritionNotes(text: string): CatalogueNutritionNote[] {
  return parseLines(text).map((line, index) => {
    const [label, value] = parseDelimitedLine(line);
    if (!label || !value) {
      throw new Error(`Nutrition note ${index + 1} must be: label | value`);
    }
    return { label, value };
  });
}

function parseGalleryImages(text: string): CatalogueGalleryImage[] {
  return parseLines(text).map((line, index) => {
    const [url, altText, label] = parseDelimitedLine(line);
    if (!url || !altText) {
      throw new Error(`Gallery image ${index + 1} must be: url | alt text | label`);
    }
    return {
      url,
      altText,
      label: label || undefined,
    };
  });
}

function parsePackFormats(text: string): CataloguePackFormat[] {
  const lines = parseLines(text);
  if (lines.length === 0) {
    throw new Error("At least one pack or size format is required.");
  }

  return lines.map((line, index) => {
    const [id, label] = parseDelimitedLine(line);
    if (!label) {
      throw new Error(`Pack format ${index + 1} must be: id | label`);
    }
    return {
      id: id || "",
      label,
    };
  });
}

function toFormState(product: CatalogueProduct): CatalogFormState {
  return {
    slug: product.slug,
    status: product.status,
    name: product.name,
    category: product.category,
    shortDescription: product.shortDescription,
    longDescription: product.longDescription,
    imageUrl: product.imageUrl,
    galleryUrlsText: toTextList(product.galleryUrls),
    galleryImagesText: (product.galleryImages ?? [])
      .map((entry) => [entry.url, entry.altText, entry.label ?? ""].join(" | "))
      .join("\n"),
    allergensText: toTextList(product.allergens),
    ingredientsText: toTextList(product.ingredients),
    nutritionNotesText: product.nutritionNotes
      .map((entry) => [entry.label, entry.value].join(" | "))
      .join("\n"),
    bestForText: toTextList(product.bestFor),
    shelfLife: product.shelfLife ?? "",
    storageInstructionsText: toTextList(product.storageInstructions ?? []),
    packFormatsText: product.packFormats
      .map((format) => [format.id, format.label].join(" | "))
      .join("\n"),
  };
}

function buildProductPayload(form: CatalogFormState) {
  return {
    slug: form.slug.trim(),
    status: form.status,
    name: form.name.trim(),
    category: form.category.trim(),
    shortDescription: form.shortDescription.trim(),
    longDescription: form.longDescription.trim(),
    imageUrl: form.imageUrl.trim(),
    galleryUrls: parseLines(form.galleryUrlsText),
    galleryImages: parseGalleryImages(form.galleryImagesText),
    allergens: parseLines(form.allergensText),
    ingredients: parseLines(form.ingredientsText),
    nutritionNotes: parseNutritionNotes(form.nutritionNotesText),
    nutrition: parseNutritionNotes(form.nutritionNotesText),
    bestFor: parseLines(form.bestForText),
    shelfLife: form.shelfLife.trim(),
    storageInstructions: parseLines(form.storageInstructionsText),
    packFormats: parsePackFormats(form.packFormatsText),
  };
}

export function CatalogManagerClient() {
  const [role, setRole] = useState("Unknown");
  const [products, setProducts] = useState<CatalogueProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [form, setForm] = useState<CatalogFormState>(emptyFormState);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("Loading catalogue...");

  const selectedProduct = useMemo(
    () => products.find((entry) => entry.id === selectedProductId) ?? null,
    [products, selectedProductId],
  );
  const canWrite = role === "SUPER_ADMIN" || role === "CONTENT_EDITOR" || role === "SALES_MANAGER";

  const reloadProducts = useCallback(async (preferredProductId?: string) => {
    const response = await fetch("/api/admin/catalog/products", { cache: "no-store" });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to load catalogue products.");
      return;
    }

    const data = (await response.json()) as CatalogProductsResponse;
    setRole(data.role);
    setProducts(data.products);

    const target = preferredProductId
      ? data.products.find((entry) => entry.id === preferredProductId)
      : data.products[0];

    if (target) {
      setSelectedProductId(target.id);
      setForm(toFormState(target));
    } else {
      setSelectedProductId("");
      setForm(emptyFormState);
    }

    setStatus("Catalogue manager ready.");
  }, []);

  useEffect(() => {
    void reloadProducts();
  }, [reloadProducts]);

  function updateForm(partial: Partial<CatalogFormState>) {
    setForm((current) => ({ ...current, ...partial }));
  }

  async function uploadProductImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      setStatus("Select an image file for the product.");
      return;
    }
    if (file.size > maxProductImageUploadBytes) {
      setStatus("Product image is too large. Use a compressed image below 1.5MB.");
      return;
    }

    setStatus("Loading product image...");
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setForm((current) => ({
        ...current,
        imageUrl: dataUrl,
        galleryUrlsText: current.galleryUrlsText.includes(dataUrl)
          ? current.galleryUrlsText
          : [dataUrl, ...parseLines(current.galleryUrlsText)].join("\n"),
        galleryImagesText: current.galleryImagesText.includes(dataUrl)
          ? current.galleryImagesText
          : [
              `${dataUrl} | ${current.name || "De-Nest Bread product"} | Primary product photo`,
              ...parseLines(current.galleryImagesText),
            ].join("\n"),
      }));
      setStatus("Product image loaded. Save the product to publish the change.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load selected image.");
    }
  }

  async function addGalleryImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      setStatus("Select an image file for the product gallery.");
      return;
    }
    if (file.size > maxProductImageUploadBytes) {
      setStatus("Gallery image is too large. Use a compressed image below 1.5MB.");
      return;
    }

    setStatus("Loading gallery image...");
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const label = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      setForm((current) => ({
        ...current,
        galleryUrlsText: [...parseLines(current.galleryUrlsText), dataUrl].join("\n"),
        galleryImagesText: [
          ...parseLines(current.galleryImagesText),
          `${dataUrl} | ${current.name || "De-Nest Bread product"} ${label} | ${label}`,
        ].join("\n"),
      }));
      setStatus("Gallery image loaded. Save the product to publish the change.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load selected image.");
    }
  }

  async function createProduct() {
    if (!canWrite) {
      setStatus("This role has read-only access.");
      return;
    }

    let payload: ReturnType<typeof buildProductPayload>;
    try {
      payload = buildProductPayload(form);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invalid product form.");
      return;
    }

    setSaving(true);
    setStatus("Creating product...");
    const response = await fetch("/api/admin/catalog/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to create product.");
      setSaving(false);
      return;
    }

    const data = (await response.json()) as CatalogProductResponse;
    await reloadProducts(data.product.id);
    setStatus(`Created product ${data.product.name}.`);
    setSaving(false);
  }

  async function updateProduct() {
    if (!selectedProductId) {
      setStatus("Select a product to update.");
      return;
    }
    if (!canWrite) {
      setStatus("This role has read-only access.");
      return;
    }

    let payload: ReturnType<typeof buildProductPayload>;
    try {
      payload = buildProductPayload(form);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invalid product form.");
      return;
    }

    setSaving(true);
    setStatus("Updating product...");
    const response = await fetch(`/api/admin/catalog/products/${selectedProductId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to update product.");
      setSaving(false);
      return;
    }

    const data = (await response.json()) as CatalogProductResponse;
    await reloadProducts(data.product.id);
    setStatus(`Updated product ${data.product.name}.`);
    setSaving(false);
  }

  async function deleteProduct() {
    if (!selectedProductId) {
      setStatus("Select a product to delete.");
      return;
    }
    if (!canWrite) {
      setStatus("This role has read-only access.");
      return;
    }

    if (!window.confirm("Delete this product? This cannot be undone.")) {
      return;
    }

    setSaving(true);
    setStatus("Deleting product...");
    const response = await fetch(`/api/admin/catalog/products/${selectedProductId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to delete product.");
      setSaving(false);
      return;
    }

    const data = (await response.json()) as CatalogProductResponse;
    await reloadProducts();
    setStatus(`Deleted product ${data.product.name}.`);
    setSaving(false);
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    window.location.assign("/admin/login");
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-2">
        <Badge>Catalogue Admin</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Product Catalogue Manager
        </h1>
        <p className="text-sm text-neutral-600">
          Role: <span className="font-semibold">{role}</span>. Manage product names, descriptions,
          images, ingredients, allergens, nutrition notes, and pack or size formats.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Products
          </p>
          <select
            value={selectedProductId}
            onChange={(event) => {
              const nextId = event.target.value;
              setSelectedProductId(nextId);
              const target = products.find((entry) => entry.id === nextId);
              setForm(target ? toFormState(target) : emptyFormState);
            }}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900"
          >
            <option value="">New product form</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} · {product.status}
              </option>
            ))}
          </select>

          {selectedProduct ? (
            <div className="rounded-xl border border-neutral-200 p-3 text-xs text-neutral-500">
              <p>ID: {selectedProduct.id}</p>
              <p>Updated: {selectedProduct.updatedAt}</p>
              <p>Formats: {selectedProduct.packFormats.length}</p>
            </div>
          ) : null}

          <p className="text-xs text-neutral-500">
            {products.length} product{products.length === 1 ? "" : "s"} in the catalogue.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setForm(emptyFormState)} disabled={saving}>
              Reset Form
            </Button>
            <Button variant="secondary" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Product Form
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={form.slug}
              onChange={(event) => updateForm({ slug: event.target.value })}
              placeholder="Slug"
            />
            <select
              value={form.status}
              onChange={(event) =>
                updateForm({ status: event.target.value as CatalogueProductStatus })
              }
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900"
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
            <Input
              value={form.name}
              onChange={(event) => updateForm({ name: event.target.value })}
              placeholder="Product name"
            />
            <Input
              value={form.category}
              onChange={(event) => updateForm({ category: event.target.value })}
              placeholder="Category"
            />
            <Input
              value={form.imageUrl}
              onChange={(event) => updateForm({ imageUrl: event.target.value })}
              placeholder="Primary image URL"
            />
          </div>

          <div className="grid gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 md:grid-cols-[10rem_1fr] md:items-center">
            <img
              src={form.imageUrl}
              alt={form.name || "Product preview"}
              className="h-36 w-full rounded-xl bg-white object-contain"
            />
            <div className="space-y-3">
              <p className="text-sm font-semibold text-neutral-900">Product photos</p>
              <p className="text-xs leading-5 text-neutral-500">
                Upload compressed product images. The primary image appears on product cards; gallery
                images appear on the product detail page.
              </p>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-full border border-[color:var(--border)] bg-white px-4 text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-neutral-800 transition hover:border-[color:var(--border-strong)]">
                  Replace Primary Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => void uploadProductImage(event)}
                  />
                </label>
                <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-full border border-[color:var(--border)] bg-white px-4 text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-neutral-800 transition hover:border-[color:var(--border-strong)]">
                  Add Gallery Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => void addGalleryImage(event)}
                  />
                </label>
              </div>
            </div>
          </div>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Short Description
            </span>
            <textarea
              value={form.shortDescription}
              onChange={(event) => updateForm({ shortDescription: event.target.value })}
              className="min-h-20 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Detailed Description
            </span>
            <textarea
              value={form.longDescription}
              onChange={(event) => updateForm({ longDescription: event.target.value })}
              className="min-h-32 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Gallery URLs
              </span>
              <textarea
                value={form.galleryUrlsText}
                onChange={(event) => updateForm({ galleryUrlsText: event.target.value })}
                className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Gallery Metadata
              </span>
              <textarea
                value={form.galleryImagesText}
                onChange={(event) => updateForm({ galleryImagesText: event.target.value })}
                className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 font-mono text-xs text-neutral-900"
              />
              <span className="text-xs text-neutral-500">Format: url | alt text | label</span>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Pack / Size Formats
              </span>
              <textarea
                value={form.packFormatsText}
                onChange={(event) => updateForm({ packFormatsText: event.target.value })}
                className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 font-mono text-xs text-neutral-900"
              />
              <span className="text-xs text-neutral-500">Format: id | label</span>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Allergens
              </span>
              <textarea
                value={form.allergensText}
                onChange={(event) => updateForm({ allergensText: event.target.value })}
                className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Ingredients
              </span>
              <textarea
                value={form.ingredientsText}
                onChange={(event) => updateForm({ ingredientsText: event.target.value })}
                className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Best For
              </span>
              <textarea
                value={form.bestForText}
                onChange={(event) => updateForm({ bestForText: event.target.value })}
                className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Storage Instructions
              </span>
              <textarea
                value={form.storageInstructionsText}
                onChange={(event) => updateForm({ storageInstructionsText: event.target.value })}
                className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900"
              />
            </label>
          </div>

          <Input
            value={form.shelfLife}
            onChange={(event) => updateForm({ shelfLife: event.target.value })}
            placeholder="Shelf life / freshness note"
          />

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Nutrition Notes
            </span>
            <textarea
              value={form.nutritionNotesText}
              onChange={(event) => updateForm({ nutritionNotesText: event.target.value })}
              className="min-h-28 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 font-mono text-xs text-neutral-900"
            />
            <span className="text-xs text-neutral-500">Format: label | value</span>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={createProduct} disabled={saving || !canWrite}>
              {saving ? "Working..." : "Create Product"}
            </Button>
            <Button
              variant="secondary"
              onClick={updateProduct}
              disabled={saving || !selectedProductId || !canWrite}
            >
              Update Product
            </Button>
            <Button
              variant="secondary"
              onClick={deleteProduct}
              disabled={saving || !selectedProductId || !canWrite}
            >
              Delete Product
            </Button>
            <p className="text-xs text-neutral-500">{status}</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
