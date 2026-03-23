"use client";

import { useEffect, useMemo, useState } from "react";

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
  imageUrl: "/placeholders/hero-image-placeholder.svg",
  status: "draft",
  publishAt: "",
  order: "1",
};

const statusOptions: CmsPublicationStatus[] = ["draft", "published", "scheduled"];

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

  useEffect(() => {
    void reloadBanners();
  }, []);

  async function reloadBanners(preferredBannerId?: string) {
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
  }

  function updateForm(partial: Partial<BannerFormState>) {
    setForm((current) => ({ ...current, ...partial }));
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
        <Badge>Banner Admin</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Banner Manager
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Role: <span className="font-semibold">{role}</span>. Create, schedule, and reorder hero
          banners.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Banners
          </p>
          <select
            value={selectedBannerId}
            onChange={(event) => {
              const nextId = event.target.value;
              setSelectedBannerId(nextId);
              const target = banners.find((entry) => entry.id === nextId);
              setForm(target ? toForm(target) : emptyForm);
            }}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          >
            <option value="">New banner form</option>
            {banners.map((banner) => (
              <option key={banner.id} value={banner.id}>
                {banner.order}. {banner.label} · {banner.status}
              </option>
            ))}
          </select>

          {selectedBanner ? (
            <div className="rounded-xl border border-neutral-200 p-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              <p>ID: {selectedBanner.id}</p>
              <p>Updated: {selectedBanner.updatedAt}</p>
              <p>Order: {selectedBanner.order}</p>
            </div>
          ) : null}

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {banners.length} banner{banners.length === 1 ? "" : "s"} configured.
          </p>
          <Button variant="secondary" onClick={() => setForm(emptyForm)} disabled={saving}>
            Reset Form
          </Button>
        </Card>

        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Banner Form
          </p>
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
              placeholder="Image URL"
            />
            <select
              value={form.status}
              onChange={(event) =>
                updateForm({ status: event.target.value as CmsPublicationStatus })
              }
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
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
              placeholder="CTA label (optional)"
            />
            <Input
              value={form.ctaHref}
              onChange={(event) => updateForm({ ctaHref: event.target.value })}
              placeholder="CTA URL (optional)"
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
              className="min-h-24 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
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
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
