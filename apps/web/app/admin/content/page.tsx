"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type CmsPage, type CmsPageSlug, type CmsPublicationStatus } from "@/lib/cms/types";

type CmsPagesResponse = {
  pages: CmsPage[];
};

type CmsPageResponse = {
  page: CmsPage;
  role?: string;
};

type SessionResponse = {
  authenticated: boolean;
  role?: string;
  permissions?: string[];
};

const statusOptions: CmsPublicationStatus[] = ["draft", "published", "scheduled"];

const emptyFormState = {
  title: "",
  headline: "",
  description: "",
  status: "draft" as CmsPublicationStatus,
  publishAt: "",
  ctaPrimaryLabel: "",
  ctaPrimaryHref: "",
  ctaSecondaryLabel: "",
  ctaSecondaryHref: "",
  heroImageUrl: "",
  logoImageUrl: "",
  seoTitle: "",
  seoDescription: "",
  seoOgImageUrl: "",
};

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

export default function AdminContentPage() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<CmsPageSlug | null>(null);
  const [form, setForm] = useState(emptyFormState);
  const [status, setStatus] = useState("Loading content...");
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<string>("Unknown");

  useEffect(() => {
    async function load() {
      try {
        const [sessionResponse, pagesResponse] = await Promise.all([
          fetch("/api/admin/session", { cache: "no-store" }),
          fetch("/api/cms/pages?preview=1", { cache: "no-store" }),
        ]);

        if (sessionResponse.ok) {
          const session = (await sessionResponse.json()) as SessionResponse;
          setRole(session.role ?? "Unknown");
        }

        if (!pagesResponse.ok) {
          setStatus("Unable to load CMS pages.");
          return;
        }

        const pagesData = (await pagesResponse.json()) as CmsPagesResponse;
        setPages(pagesData.pages);
        setSelectedSlug(pagesData.pages[0]?.slug ?? null);
        setStatus("Preview content loaded.");
      } catch {
        setStatus("Unable to load CMS pages.");
      }
    }

    void load();
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
      status: selectedPage.status,
      publishAt: toDateTimeInputValue(selectedPage.publishAt),
      ctaPrimaryLabel: selectedPage.ctaPrimaryLabel ?? "",
      ctaPrimaryHref: selectedPage.ctaPrimaryHref ?? "",
      ctaSecondaryLabel: selectedPage.ctaSecondaryLabel ?? "",
      ctaSecondaryHref: selectedPage.ctaSecondaryHref ?? "",
      heroImageUrl: selectedPage.heroImageUrl ?? "",
      logoImageUrl: selectedPage.logoImageUrl ?? "",
      seoTitle: selectedPage.seo.title ?? "",
      seoDescription: selectedPage.seo.description ?? "",
      seoOgImageUrl: selectedPage.seo.ogImageUrl ?? "",
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
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setStatus(body?.error ?? "Save failed.");
        setSaving(false);
        return;
      }

      const payload = (await response.json()) as CmsPageResponse;
      setPages((current) => current.map((page) => (page.slug === payload.page.slug ? payload.page : page)));
      setStatus(
        `Saved ${payload.page.slug} (${payload.page.status}) at ${new Date(payload.page.updatedAt).toLocaleTimeString("en-NG")}`,
      );
    } catch {
      setStatus("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    window.location.assign("/admin/login");
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-16 md:px-6">
      <div className="space-y-2">
        <Badge>Admin CMS</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Content Manager
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Role: <span className="font-semibold">{role}</span>. Manage publishing state, scheduling, SEO,
          and visual placeholders.
        </p>
      </div>

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
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">Status</span>
            <select
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as CmsPublicationStatus,
                }))
              }
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">Title</span>
            <Input value={form.title} onChange={(event) => setForm((s) => ({ ...s, title: event.target.value }))} />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">Publish At</span>
            <Input
              type="datetime-local"
              value={form.publishAt}
              onChange={(event) => setForm((s) => ({ ...s, publishAt: event.target.value }))}
            />
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
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Hero Image URL
            </span>
            <Input
              value={form.heroImageUrl}
              onChange={(event) => setForm((s) => ({ ...s, heroImageUrl: event.target.value }))}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              Logo URL
            </span>
            <Input
              value={form.logoImageUrl}
              onChange={(event) => setForm((s) => ({ ...s, logoImageUrl: event.target.value }))}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">SEO Title</span>
            <Input
              value={form.seoTitle}
              onChange={(event) => setForm((s) => ({ ...s, seoTitle: event.target.value }))}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              SEO Description
            </span>
            <Input
              value={form.seoDescription}
              onChange={(event) => setForm((s) => ({ ...s, seoDescription: event.target.value }))}
            />
          </label>
          <label className="block space-y-2 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
              SEO OG Image URL
            </span>
            <Input
              value={form.seoOgImageUrl}
              onChange={(event) => setForm((s) => ({ ...s, seoOgImageUrl: event.target.value }))}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={savePage} disabled={saving || !selectedSlug}>
            {saving ? "Saving..." : "Save Page"}
          </Button>
          <Button variant="secondary" onClick={signOut}>
            Sign Out
          </Button>
          <Link href="/" className="text-xs text-neutral-500 underline dark:text-neutral-400">
            Open live site
          </Link>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{status}</p>
        </div>
      </Card>
    </section>
  );
}
