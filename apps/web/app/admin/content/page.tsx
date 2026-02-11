"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type CmsPage, type CmsPageSlug } from "@/lib/cms/types";

type CmsPagesResponse = {
  pages: CmsPage[];
};

type CmsPageResponse = {
  page: CmsPage;
};

const emptyFormState = {
  title: "",
  headline: "",
  description: "",
  ctaPrimaryLabel: "",
  ctaPrimaryHref: "",
  ctaSecondaryLabel: "",
  ctaSecondaryHref: "",
};

export default function AdminContentPage() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<CmsPageSlug | null>(null);
  const [form, setForm] = useState(emptyFormState);
  const [adminToken, setAdminToken] = useState("");
  const [status, setStatus] = useState("Loading content...");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPages() {
      try {
        const response = await fetch("/api/cms/pages");
        if (!response.ok) {
          setStatus("Failed to load content.");
          return;
        }

        const data = (await response.json()) as CmsPagesResponse;
        setPages(data.pages);
        setSelectedSlug(data.pages[0]?.slug ?? null);
        setStatus("Content loaded.");
      } catch {
        setStatus("Failed to load content.");
      }
    }

    void loadPages();
  }, []);

  const selectedPage = useMemo(
    () => pages.find((page) => page.slug === selectedSlug) ?? null,
    [pages, selectedSlug],
  );

  useEffect(() => {
    if (!selectedPage) {
      return;
    }

    setForm({
      title: selectedPage.title,
      headline: selectedPage.headline,
      description: selectedPage.description,
      ctaPrimaryLabel: selectedPage.ctaPrimaryLabel ?? "",
      ctaPrimaryHref: selectedPage.ctaPrimaryHref ?? "",
      ctaSecondaryLabel: selectedPage.ctaSecondaryLabel ?? "",
      ctaSecondaryHref: selectedPage.ctaSecondaryHref ?? "",
    });
  }, [selectedPage]);

  async function savePage() {
    if (!selectedSlug) {
      return;
    }

    setSaving(true);
    setStatus("Saving...");

    try {
      const response = await fetch(`/api/cms/pages/${selectedSlug}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
        setStatus(errorBody?.error ?? "Failed to save.");
        setSaving(false);
        return;
      }

      const payload = (await response.json()) as CmsPageResponse;
      setPages((current) => current.map((page) => (page.slug === payload.page.slug ? payload.page : page)));
      setStatus(`Saved ${payload.page.slug} at ${new Date(payload.page.updatedAt).toLocaleTimeString("en-NG")}`);
    } catch {
      setStatus("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-2">
        <Badge>Admin CMS</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Content Manager
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Update key marketing pages dynamically. This editor requires `ADMIN_API_TOKEN` and sends
          secure admin updates through API routes.
        </p>
      </div>

      <Card className="space-y-4">
        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
            Admin API Token
          </span>
          <Input
            type="password"
            placeholder="Set token in .env.local and paste it here"
            value={adminToken}
            onChange={(event) => setAdminToken(event.target.value)}
          />
        </label>
      </Card>

      <Card className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">Page</span>
            <select
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              value={selectedSlug ?? ""}
              onChange={(event) => setSelectedSlug(event.target.value as CmsPageSlug)}
            >
              {pages.map((page) => (
                <option key={page.slug} value={page.slug}>
                  {page.slug}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">Title</span>
            <Input value={form.title} onChange={(event) => setForm((s) => ({ ...s, title: event.target.value }))} />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">Headline</span>
          <Input value={form.headline} onChange={(event) => setForm((s) => ({ ...s, headline: event.target.value }))} />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">Description</span>
          <textarea
            value={form.description}
            onChange={(event) => setForm((s) => ({ ...s, description: event.target.value }))}
            className="min-h-32 w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Primary CTA Label
            </span>
            <Input
              value={form.ctaPrimaryLabel}
              onChange={(event) => setForm((s) => ({ ...s, ctaPrimaryLabel: event.target.value }))}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Primary CTA URL
            </span>
            <Input
              value={form.ctaPrimaryHref}
              onChange={(event) => setForm((s) => ({ ...s, ctaPrimaryHref: event.target.value }))}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Secondary CTA Label
            </span>
            <Input
              value={form.ctaSecondaryLabel}
              onChange={(event) => setForm((s) => ({ ...s, ctaSecondaryLabel: event.target.value }))}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Secondary CTA URL
            </span>
            <Input
              value={form.ctaSecondaryHref}
              onChange={(event) => setForm((s) => ({ ...s, ctaSecondaryHref: event.target.value }))}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={savePage} disabled={saving || !selectedSlug}>
            {saving ? "Saving..." : "Save Page"}
          </Button>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
        </div>
      </Card>
    </section>
  );
}
