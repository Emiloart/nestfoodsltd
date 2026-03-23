"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  type CommerceProduct,
  type NutritionItem,
  type ProductAvailabilityStatus,
  type ProductStatus,
  type ProductVariant,
} from "@/lib/commerce/types";

type CatalogProductsResponse = {
  role: string;
  products: CommerceProduct[];
};

type CatalogProductResponse = {
  role: string;
  product: CommerceProduct;
};

type CatalogFormState = {
  slug: string;
  status: ProductStatus;
  availabilityStatus: ProductAvailabilityStatus;
  availableRegionsText: string;
  minimumOrderQuantity: string;
  maximumOrderQuantity: string;
  name: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  imageUrl: string;
  galleryUrlsText: string;
  tagsText: string;
  allergensText: string;
  ingredientsText: string;
  shelfLifeDays: string;
  nutritionText: string;
  variantsText: string;
};

const emptyFormState: CatalogFormState = {
  slug: "",
  status: "draft",
  availabilityStatus: "available",
  availableRegionsText: "Lagos",
  minimumOrderQuantity: "10",
  maximumOrderQuantity: "10000",
  name: "",
  category: "",
  shortDescription: "",
  longDescription: "",
  imageUrl: "/placeholders/product-hero.jpg",
  galleryUrlsText: "/placeholders/product-hero.jpg",
  tagsText: "",
  allergensText: "",
  ingredientsText: "",
  shelfLifeDays: "30",
  nutritionText: "Energy | 0 | kcal",
  variantsText: "default | Standard Pack | SKU-001 | Pack | in_stock | 0 | NGN | false",
};

const stockStatusOptions: ProductVariant["stockStatus"][] = [
  "in_stock",
  "low_stock",
  "out_of_stock",
];

const currencyOptions: ProductVariant["currency"][] = ["NGN", "USD"];

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

function parseBoolean(value: string, lineNumber: number) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }
  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }
  throw new Error(`Variant row ${lineNumber}: subscription field must be true/false.`);
}

function parseNutritionTable(text: string): NutritionItem[] {
  const lines = parseLines(text);
  if (lines.length === 0) {
    throw new Error("Nutrition table requires at least one row.");
  }

  return lines.map((line, index) => {
    const [label, amountRaw, unit] = parseDelimitedLine(line);
    if (!label || !amountRaw || !unit) {
      throw new Error(`Nutrition row ${index + 1} must be: label | amount | unit`);
    }

    const amount = Number(amountRaw);
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error(`Nutrition row ${index + 1} has invalid amount.`);
    }

    return { label, amount, unit };
  });
}

function parseVariants(text: string): ProductVariant[] {
  const lines = parseLines(text);
  if (lines.length === 0) {
    throw new Error("At least one variant row is required.");
  }

  return lines.map((line, index) => {
    const [id, name, sku, sizeLabel, stockStatus, priceMinorRaw, currency, subscriptionRaw] =
      parseDelimitedLine(line);

    if (!name || !sku || !stockStatus || !priceMinorRaw || !currency || !subscriptionRaw) {
      throw new Error(
        `Variant row ${index + 1} must be: id | name | sku | size | stock | priceMinor | currency | subscription`,
      );
    }

    if (!stockStatusOptions.includes(stockStatus as ProductVariant["stockStatus"])) {
      throw new Error(`Variant row ${index + 1} has invalid stock status.`);
    }

    if (!currencyOptions.includes(currency as ProductVariant["currency"])) {
      throw new Error(`Variant row ${index + 1} has invalid currency.`);
    }

    const priceMinor = Number(priceMinorRaw);
    if (!Number.isFinite(priceMinor) || priceMinor < 0) {
      throw new Error(`Variant row ${index + 1} has invalid price.`);
    }

    return {
      id: id || "",
      name,
      sku,
      sizeLabel: sizeLabel || undefined,
      stockStatus: stockStatus as ProductVariant["stockStatus"],
      priceMinor: Math.round(priceMinor),
      currency: currency as ProductVariant["currency"],
      subscriptionEligible: parseBoolean(subscriptionRaw, index + 1),
    };
  });
}

function toFormState(product: CommerceProduct): CatalogFormState {
  return {
    slug: product.slug,
    status: product.status,
    availabilityStatus: product.availabilityStatus,
    availableRegionsText: toTextList(product.availableRegions),
    minimumOrderQuantity: String(product.minimumOrderQuantity),
    maximumOrderQuantity: String(product.maximumOrderQuantity),
    name: product.name,
    category: product.category,
    shortDescription: product.shortDescription,
    longDescription: product.longDescription,
    imageUrl: product.imageUrl,
    galleryUrlsText: toTextList(product.galleryUrls),
    tagsText: toTextList(product.tags),
    allergensText: toTextList(product.allergens),
    ingredientsText: toTextList(product.ingredients),
    shelfLifeDays: String(product.shelfLifeDays),
    nutritionText: product.nutritionTable
      .map((entry) => [entry.label, entry.amount, entry.unit].join(" | "))
      .join("\n"),
    variantsText: product.variants
      .map((variant) =>
        [
          variant.id,
          variant.name,
          variant.sku,
          variant.sizeLabel ?? "",
          variant.stockStatus,
          variant.priceMinor,
          variant.currency,
          variant.subscriptionEligible,
        ].join(" | "),
      )
      .join("\n"),
  };
}

function buildProductPayload(form: CatalogFormState) {
  const shelfLifeDays = Number(form.shelfLifeDays);
  if (!Number.isFinite(shelfLifeDays) || shelfLifeDays < 1) {
    throw new Error("Shelf life must be a valid positive number.");
  }
  const minimumOrderQuantity = Number(form.minimumOrderQuantity);
  if (!Number.isFinite(minimumOrderQuantity) || minimumOrderQuantity < 1) {
    throw new Error("Minimum order quantity must be a valid positive number.");
  }
  const maximumOrderQuantity = Number(form.maximumOrderQuantity);
  if (!Number.isFinite(maximumOrderQuantity) || maximumOrderQuantity < minimumOrderQuantity) {
    throw new Error("Maximum order quantity must be greater than or equal to minimum order quantity.");
  }
  const availableRegions = parseLines(form.availableRegionsText);
  if (availableRegions.length === 0) {
    throw new Error("At least one available region is required.");
  }

  return {
    slug: form.slug.trim(),
    status: form.status,
    availabilityStatus: form.availabilityStatus,
    availableRegions,
    minimumOrderQuantity: Math.round(minimumOrderQuantity),
    maximumOrderQuantity: Math.round(maximumOrderQuantity),
    name: form.name.trim(),
    category: form.category.trim(),
    shortDescription: form.shortDescription.trim(),
    longDescription: form.longDescription.trim(),
    imageUrl: form.imageUrl.trim(),
    galleryUrls: parseLines(form.galleryUrlsText),
    tags: parseLines(form.tagsText),
    allergens: parseLines(form.allergensText),
    ingredients: parseLines(form.ingredientsText),
    shelfLifeDays: Math.round(shelfLifeDays),
    nutritionTable: parseNutritionTable(form.nutritionText),
    variants: parseVariants(form.variantsText),
  };
}

export function CatalogManagerClient() {
  const [role, setRole] = useState("Unknown");
  const [products, setProducts] = useState<CommerceProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [form, setForm] = useState<CatalogFormState>(emptyFormState);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("Loading catalog...");

  const selectedProduct = useMemo(
    () => products.find((entry) => entry.id === selectedProductId) ?? null,
    [products, selectedProductId],
  );
  const canWrite = role === "SUPER_ADMIN" || role === "CONTENT_EDITOR" || role === "SALES_MANAGER";

  useEffect(() => {
    void reloadProducts();
  }, []);

  async function reloadProducts(preferredProductId?: string) {
    const response = await fetch("/api/admin/catalog/products", { cache: "no-store" });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to load catalog products.");
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

    setStatus("Catalog manager ready.");
  }

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
        <Badge>Catalog Admin</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Product Catalog Manager
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Role: <span className="font-semibold">{role}</span>. Manage products, variants, nutrition,
          allergens, bulk ordering limits, and regional availability.
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
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          >
            <option value="">New product form</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} · {product.status}
              </option>
            ))}
          </select>

          {selectedProduct ? (
            <div className="rounded-xl border border-neutral-200 p-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              <p>ID: {selectedProduct.id}</p>
              <p>Updated: {selectedProduct.updatedAt}</p>
              <p>Variants: {selectedProduct.variants.length}</p>
              <p>Availability: {selectedProduct.availabilityStatus}</p>
              <p>
                Bulk range: {selectedProduct.minimumOrderQuantity} -{" "}
                {selectedProduct.maximumOrderQuantity}
              </p>
            </div>
          ) : null}

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {products.length} product{products.length === 1 ? "" : "s"} available.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setForm(emptyFormState)} disabled={saving}>
              Reset Form
            </Button>
            <Button variant="secondary" onClick={signOut}>
              Sign Out
            </Button>
          </div>

          <Link href="/b2b" className="text-xs text-neutral-500 underline dark:text-neutral-400">
            Open distributor portal
          </Link>
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
              onChange={(event) => updateForm({ status: event.target.value as ProductStatus })}
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
            <select
              value={form.availabilityStatus}
              onChange={(event) =>
                updateForm({ availabilityStatus: event.target.value as ProductAvailabilityStatus })
              }
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            >
              <option value="available">available</option>
              <option value="limited">limited</option>
              <option value="unavailable">unavailable</option>
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
            <Input
              type="number"
              min={1}
              value={form.minimumOrderQuantity}
              onChange={(event) => updateForm({ minimumOrderQuantity: event.target.value })}
              placeholder="Minimum order quantity"
            />
            <Input
              type="number"
              min={1}
              value={form.maximumOrderQuantity}
              onChange={(event) => updateForm({ maximumOrderQuantity: event.target.value })}
              placeholder="Maximum order quantity"
            />
            <Input
              type="number"
              min={1}
              value={form.shelfLifeDays}
              onChange={(event) => updateForm({ shelfLifeDays: event.target.value })}
              placeholder="Shelf life (days)"
            />
          </div>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Short Description
            </span>
            <textarea
              value={form.shortDescription}
              onChange={(event) => updateForm({ shortDescription: event.target.value })}
              className="min-h-20 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Long Description
            </span>
            <textarea
              value={form.longDescription}
              onChange={(event) => updateForm({ longDescription: event.target.value })}
              className="min-h-32 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Available Regions (one per line)
            </span>
            <textarea
              value={form.availableRegionsText}
              onChange={(event) => updateForm({ availableRegionsText: event.target.value })}
              className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Gallery URLs (one per line)
              </span>
              <textarea
                value={form.galleryUrlsText}
                onChange={(event) => updateForm({ galleryUrlsText: event.target.value })}
                className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Tags (one per line)
              </span>
              <textarea
                value={form.tagsText}
                onChange={(event) => updateForm({ tagsText: event.target.value })}
                className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Allergens (one per line)
              </span>
              <textarea
                value={form.allergensText}
                onChange={(event) => updateForm({ allergensText: event.target.value })}
                className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
                Ingredients (one per line)
              </span>
              <textarea
                value={form.ingredientsText}
                onChange={(event) => updateForm({ ingredientsText: event.target.value })}
                className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Nutrition Rows (label | amount | unit)
            </span>
            <textarea
              value={form.nutritionText}
              onChange={(event) => updateForm({ nutritionText: event.target.value })}
              className="min-h-28 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 font-mono text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Variant Rows (id | name | sku | size | stock | priceMinor | currency | subscription)
            </span>
            <textarea
              value={form.variantsText}
              onChange={(event) => updateForm({ variantsText: event.target.value })}
              className="min-h-36 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 font-mono text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
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
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
