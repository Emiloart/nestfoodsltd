"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
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
  allergensText: string;
  ingredientsText: string;
  nutritionNotesText: string;
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
  allergensText: "Contains wheat (gluten)\nContains milk\nMay contain traces of soya",
  ingredientsText: "Enriched wheat flour\nWater\nSugar\nVegetable oil\nYeast\nSalt\nMilk\nButter",
  nutritionNotesText:
    "Nutrition profile | Prepared as a soft, satisfying wheat bread for everyday meals.",
  packFormatsText: "default | Standard loaf | DENEST-STANDARD",
};

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

function parsePackFormats(text: string): CataloguePackFormat[] {
  const lines = parseLines(text);
  if (lines.length === 0) {
    throw new Error("At least one pack or size format is required.");
  }

  return lines.map((line, index) => {
    const [id, label, sku] = parseDelimitedLine(line);
    if (!label) {
      throw new Error(`Pack format ${index + 1} must be: id | label | sku`);
    }
    return {
      id: id || "",
      label,
      sku: sku || undefined,
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
    allergensText: toTextList(product.allergens),
    ingredientsText: toTextList(product.ingredients),
    nutritionNotesText: product.nutritionNotes
      .map((entry) => [entry.label, entry.value].join(" | "))
      .join("\n"),
    packFormatsText: product.packFormats
      .map((format) => [format.id, format.label, format.sku ?? ""].join(" | "))
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
    allergens: parseLines(form.allergensText),
    ingredients: parseLines(form.ingredientsText),
    nutritionNotes: parseNutritionNotes(form.nutritionNotesText),
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
                Pack / Size Formats
              </span>
              <textarea
                value={form.packFormatsText}
                onChange={(event) => updateForm({ packFormatsText: event.target.value })}
                className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 font-mono text-xs text-neutral-900"
              />
              <span className="text-xs text-neutral-500">Format: id | label | sku</span>
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
