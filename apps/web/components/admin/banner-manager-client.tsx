"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type CmsBanner, type CmsPublicationStatus } from "@/lib/cms/types";

type AdminBannersResponse = {
  role: string;
  banners: CmsBanner[];
};

type BannerResponse = {
  role: string;
  banner: CmsBanner;
};

type BannerFormState = {
  label: string;
  headline: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  status: CmsPublicationStatus;
  publishAt: string;
  order: string;
};

const emptyForm: BannerFormState = {
  label: "",
  headline: "",
  ctaLabel: "",
  ctaHref: "",
  imageUrl: "/media/products/nestfoodsltd-family-loaf-texture.png",
  status: "draft",
  publishAt: "",
  order: "1",
};

const maxBannerUploadBytes = 1_500_000;
const statusOptions: CmsPublicationStatus[] = ["draft", "published", "scheduled"];

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

function toDateTimeInputValue(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toForm(banner: CmsBanner): BannerFormState {
  return {
    label: banner.label,
    headline: banner.headline,
    ctaLabel: banner.ctaLabel ?? "",
    ctaHref: banner.ctaHref ?? "",
    imageUrl: banner.imageUrl,
    status: banner.status,
    publishAt: toDateTimeInputValue(banner.publishAt),
    order: String(banner.order),
  };
}

function buildPayload(form: BannerFormState) {
  const numericOrder = Math.max(1, Math.round(Number(form.order || 1)));
  return {
    label: form.label.trim(),
    headline: form.headline.trim(),
    ctaLabel: form.ctaLabel.trim() || undefined,
    ctaHref: form.ctaHref.trim() || undefined,
    imageUrl: form.imageUrl.trim(),
    status: form.status,
    publishAt: form.publishAt ? new Date(form.publishAt).toISOString() : undefined,
    order: numericOrder,
  };
}

export function BannerManagerClient() {
  const [role, setRole] = useState("Unknown");
  const [banners, setBanners] = useState<CmsBanner[]>([]);
  const [selectedBannerId, setSelectedBannerId] = useState("");
  const [form, setForm] = useState<BannerFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("Loading banners...");

  const selectedBanner = useMemo(
    () => banners.find((entry) => entry.id === selectedBannerId) ?? null,
    [banners, selectedBannerId],
  );
  const canWrite = role === "SUPER_ADMIN" || role === "CONTENT_EDITOR";

  const reloadBanners = useCallback(async (preferredBannerId?: string) => {
    const response = await fetch("/api/admin/cms/banners", { cache: "no-store" });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to load banners.");
      return;
    }

    const data = (await response.json()) as AdminBannersResponse;
    setRole(data.role);
    setBanners(data.banners);

    const target = preferredBannerId
      ? data.banners.find((entry) => entry.id === preferredBannerId)
      : data.banners[0];

    if (target) {
      setSelectedBannerId(target.id);
      setForm(toForm(target));
    } else {
      setSelectedBannerId("");
      setForm(emptyForm);
    }

    setStatus("Banner manager ready.");
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void reloadBanners();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [reloadBanners]);

  function updateForm(partial: Partial<BannerFormState>) {
    setForm((current) => ({ ...current, ...partial }));
  }

  async function uploadBannerImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setStatus("Select an image file for the banner.");
      return;
    }

    if (file.size > maxBannerUploadBytes) {
      setStatus("Banner image is too large. Use a compressed image below 1.5MB.");
      return;
    }

    setStatus("Loading banner image...");
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setForm((current) => ({
        ...current,
        imageUrl: dataUrl,
        label: current.label || file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
      }));
      setStatus("Banner image loaded. Save the banner to publish the change.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load selected image.");
    }
  }

  async function createBanner() {
    if (!canWrite) {
      setStatus("This role has read-only access.");
      return;
    }

    setSaving(true);
    setStatus("Creating banner...");
    const response = await fetch("/api/admin/cms/banners", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(buildPayload(form)),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to create banner.");
      setSaving(false);
      return;
    }

    const data = (await response.json()) as BannerResponse;
    await reloadBanners(data.banner.id);
    setStatus(
      `Created banner ${data.banner.label}. ${
        data.banner.status === "published"
          ? "Banner is live on homepage."
          : "Banner saved but not live until published/scheduled."
      }`,
    );
    setSaving(false);
  }

  async function updateBanner() {
    if (!selectedBannerId) {
      setStatus("Select a banner to update.");
      return;
    }
    if (!canWrite) {
      setStatus("This role has read-only access.");
      return;
    }

    setSaving(true);
    setStatus("Updating banner...");
    const response = await fetch(`/api/admin/cms/banners/${selectedBannerId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(buildPayload(form)),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to update banner.");
      setSaving(false);
      return;
    }

    const data = (await response.json()) as BannerResponse;
    await reloadBanners(data.banner.id);
    setStatus(
      `Updated banner ${data.banner.label}. ${
        data.banner.status === "published"
          ? "Banner is live on homepage."
          : "Banner saved but not live until published/scheduled."
      }`,
    );
    setSaving(false);
  }

  async function deleteBanner() {
    if (!selectedBannerId) {
      setStatus("Select a banner to delete.");
      return;
    }
    if (!canWrite) {
      setStatus("This role has read-only access.");
      return;
    }

    if (!window.confirm("Delete this banner? This action cannot be undone.")) {
      return;
    }

    setSaving(true);
    setStatus("Deleting banner...");
    const response = await fetch(`/api/admin/cms/banners/${selectedBannerId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to delete banner.");
      setSaving(false);
      return;
    }

    const data = (await response.json()) as BannerResponse;
    await reloadBanners();
    setStatus(`Deleted banner ${data.banner.label}.`);
    setSaving(false);
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-2">
        <Badge>Homepage Banner</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Banner Section Manager
        </h1>
        <p className="text-sm text-neutral-600">
          Role: <span className="font-semibold">{role}</span>. Manage homepage banner images,
          publish state, display order, and action links.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Homepage Banners
          </p>
          <select
            value={selectedBannerId}
            onChange={(event) => {
              const nextId = event.target.value;
              setSelectedBannerId(nextId);
              const target = banners.find((entry) => entry.id === nextId);
              setForm(target ? toForm(target) : emptyForm);
            }}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900"
          >
            <option value="">New homepage banner</option>
            {banners.map((banner) => (
              <option key={banner.id} value={banner.id}>
                {banner.order}. {banner.label} · {banner.status}
              </option>
            ))}
          </select>

          {selectedBanner ? (
            <div className="rounded-xl border border-neutral-200 p-3 text-xs text-neutral-500">
              <p>ID: {selectedBanner.id}</p>
              <p>Updated: {selectedBanner.updatedAt}</p>
              <p>Order: {selectedBanner.order}</p>
            </div>
          ) : null}

          <p className="text-xs text-neutral-500">
            {banners.length} banner{banners.length === 1 ? "" : "s"} configured.
          </p>
          <Button variant="secondary" onClick={() => setForm(emptyForm)} disabled={saving}>
            Reset Form
          </Button>
        </Card>

        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Banner Details
          </p>
          <div className="overflow-hidden rounded-[1.25rem] border border-neutral-200 bg-neutral-100">
            <img
              src={form.imageUrl}
              alt={form.label || "Banner preview"}
              className="aspect-[16/7] w-full object-cover"
            />
          </div>
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Upload Banner Image
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => void uploadBannerImage(event)}
              disabled={saving || !canWrite}
              className="block w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 file:mr-4 file:rounded-full file:border-0 file:bg-[color:var(--brand-1)] file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.12em] file:text-white"
            />
            <span className="block text-xs leading-5 text-neutral-500">
              Use a compressed JPG, PNG, or WebP under 1.5MB. You can also paste a hosted image URL.
            </span>
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={form.label}
              onChange={(event) => updateForm({ label: event.target.value })}
              placeholder="Banner label"
            />
            <Input
              type="number"
              min={1}
              value={form.order}
              onChange={(event) => updateForm({ order: event.target.value })}
              placeholder="Display order"
            />
            <Input
              value={form.imageUrl}
              onChange={(event) => updateForm({ imageUrl: event.target.value })}
              placeholder="Banner image URL"
            />
            <select
              value={form.status}
              onChange={(event) =>
                updateForm({ status: event.target.value as CmsPublicationStatus })
              }
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Input
              value={form.ctaLabel}
              onChange={(event) => updateForm({ ctaLabel: event.target.value })}
              placeholder="Button label (optional)"
            />
            <Input
              value={form.ctaHref}
              onChange={(event) => updateForm({ ctaHref: event.target.value })}
              placeholder="Button link, e.g. /products"
            />
            <Input
              type="datetime-local"
              value={form.publishAt}
              onChange={(event) => updateForm({ publishAt: event.target.value })}
              placeholder="Publish At (scheduled)"
            />
          </div>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Headline
            </span>
            <textarea
              value={form.headline}
              onChange={(event) => updateForm({ headline: event.target.value })}
              className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={createBanner} disabled={saving || !canWrite}>
              {saving ? "Working..." : "Create Banner"}
            </Button>
            <Button
              variant="secondary"
              onClick={updateBanner}
              disabled={saving || !selectedBannerId || !canWrite}
            >
              Update Banner
            </Button>
            <Button
              variant="secondary"
              onClick={deleteBanner}
              disabled={saving || !selectedBannerId || !canWrite}
            >
              Delete Banner
            </Button>
            <p className="text-xs text-neutral-500">{status}</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
