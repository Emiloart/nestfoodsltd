"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type CmsMediaAsset } from "@/lib/cms/types";

type MediaAssetWithUsage = CmsMediaAsset & {
  usageReferences: string[];
};

type AdminMediaResponse = {
  role: string;
  assets: MediaAssetWithUsage[];
};

type MediaAssetResponse = {
  role: string;
  asset: CmsMediaAsset;
};

type MediaFormState = {
  label: string;
  kind: "image";
  url: string;
  altText: string;
  folder: string;
};

const emptyForm: MediaFormState = {
  label: "",
  kind: "image",
  url: "/placeholders/section-image-placeholder.svg",
  altText: "",
  folder: "general",
};

function toForm(asset: CmsMediaAsset): MediaFormState {
  return {
    label: asset.label,
    kind: "image",
    url: asset.url,
    altText: asset.altText ?? "",
    folder: asset.folder,
  };
}

function buildPayload(form: MediaFormState) {
  return {
    label: form.label.trim(),
    kind: "image" as const,
    url: form.url.trim(),
    altText: form.altText.trim() || undefined,
    folder: form.folder.trim(),
  };
}

export function MediaLibraryClient() {
  const [role, setRole] = useState("Unknown");
  const [assets, setAssets] = useState<MediaAssetWithUsage[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [form, setForm] = useState<MediaFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("Loading media library...");

  const selectedAsset = useMemo(
    () => assets.find((entry) => entry.id === selectedAssetId) ?? null,
    [assets, selectedAssetId],
  );
  const canWrite = role === "SUPER_ADMIN" || role === "CONTENT_EDITOR";

  useEffect(() => {
    void reloadAssets();
  }, []);

  async function reloadAssets(preferredAssetId?: string) {
    const response = await fetch("/api/admin/cms/media", { cache: "no-store" });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to load media assets.");
      return;
    }

    const data = (await response.json()) as AdminMediaResponse;
    setRole(data.role);
    setAssets(data.assets);

    const target = preferredAssetId
      ? data.assets.find((entry) => entry.id === preferredAssetId)
      : data.assets[0];

    if (target) {
      setSelectedAssetId(target.id);
      setForm(toForm(target));
    } else {
      setSelectedAssetId("");
      setForm(emptyForm);
    }

    setStatus("Media library ready.");
  }

  function updateForm(partial: Partial<MediaFormState>) {
    setForm((current) => ({ ...current, ...partial }));
  }

  async function createAsset() {
    if (!canWrite) {
      setStatus("This role has read-only access.");
      return;
    }

    setSaving(true);
    setStatus("Creating media asset...");
    const response = await fetch("/api/admin/cms/media", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(buildPayload(form)),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to create media asset.");
      setSaving(false);
      return;
    }

    const data = (await response.json()) as MediaAssetResponse;
    await reloadAssets(data.asset.id);
    setStatus(`Created media asset ${data.asset.label}.`);
    setSaving(false);
  }

  async function updateAsset() {
    if (!selectedAssetId) {
      setStatus("Select a media asset to update.");
      return;
    }
    if (!canWrite) {
      setStatus("This role has read-only access.");
      return;
    }

    setSaving(true);
    setStatus("Updating media asset...");
    const response = await fetch(`/api/admin/cms/media/${selectedAssetId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(buildPayload(form)),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to update media asset.");
      setSaving(false);
      return;
    }

    const data = (await response.json()) as MediaAssetResponse;
    await reloadAssets(data.asset.id);
    setStatus(`Updated media asset ${data.asset.label}.`);
    setSaving(false);
  }

  async function deleteAsset() {
    if (!selectedAssetId) {
      setStatus("Select a media asset to delete.");
      return;
    }
    if (!canWrite) {
      setStatus("This role has read-only access.");
      return;
    }

    if (!window.confirm("Delete this media asset?")) {
      return;
    }

    setSaving(true);
    setStatus("Deleting media asset...");
    const response = await fetch(`/api/admin/cms/media/${selectedAssetId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(body?.error ?? "Failed to delete media asset.");
      setSaving(false);
      return;
    }

    const data = (await response.json()) as MediaAssetResponse;
    await reloadAssets();
    setStatus(`Deleted media asset ${data.asset.label}.`);
    setSaving(false);
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-2">
        <Badge>Media Admin</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Media Library
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Role: <span className="font-semibold">{role}</span>. Manage image assets and inspect usage
          references.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Assets</p>
          <select
            value={selectedAssetId}
            onChange={(event) => {
              const nextId = event.target.value;
              setSelectedAssetId(nextId);
              const target = assets.find((entry) => entry.id === nextId);
              setForm(target ? toForm(target) : emptyForm);
            }}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          >
            <option value="">New media asset form</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.label} · {asset.folder}
              </option>
            ))}
          </select>

          {selectedAsset ? (
            <div className="space-y-3 rounded-xl border border-neutral-200 p-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              <p>ID: {selectedAsset.id}</p>
              <p>Updated: {selectedAsset.updatedAt}</p>
              <p className="font-semibold text-neutral-700 dark:text-neutral-300">Usage References</p>
              {selectedAsset.usageReferences.length > 0 ? (
                <ul className="space-y-1">
                  {selectedAsset.usageReferences.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ul>
              ) : (
                <p>None</p>
              )}
            </div>
          ) : null}

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {assets.length} asset{assets.length === 1 ? "" : "s"} configured.
          </p>
          <Button variant="secondary" onClick={() => setForm(emptyForm)} disabled={saving}>
            Reset Form
          </Button>
        </Card>

        <Card className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Media Form
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={form.label}
              onChange={(event) => updateForm({ label: event.target.value })}
              placeholder="Asset label"
            />
            <Input
              value={form.folder}
              onChange={(event) => updateForm({ folder: event.target.value })}
              placeholder="Folder"
            />
            <Input
              value={form.url}
              onChange={(event) => updateForm({ url: event.target.value })}
              placeholder="Asset URL"
            />
            <Input value={form.kind} disabled />
          </div>
          <Input
            value={form.altText}
            onChange={(event) => updateForm({ altText: event.target.value })}
            placeholder="Alt text (optional)"
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={createAsset} disabled={saving || !canWrite}>
              {saving ? "Working..." : "Create Asset"}
            </Button>
            <Button
              variant="secondary"
              onClick={updateAsset}
              disabled={saving || !selectedAssetId || !canWrite}
            >
              Update Asset
            </Button>
            <Button
              variant="secondary"
              onClick={deleteAsset}
              disabled={saving || !selectedAssetId || !canWrite}
            >
              Delete Asset
            </Button>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
