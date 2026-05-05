CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE cms_publication_status AS ENUM ('draft', 'published', 'scheduled');
CREATE TYPE admin_role AS ENUM ('SUPER_ADMIN', 'CONTENT_EDITOR', 'SALES_MANAGER');

CREATE TABLE IF NOT EXISTS cms_page (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  headline TEXT NOT NULL,
  description TEXT NOT NULL,
  status cms_publication_status NOT NULL DEFAULT 'draft',
  publish_at TIMESTAMPTZ,
  cta_primary_label TEXT,
  cta_primary_href TEXT,
  cta_secondary_label TEXT,
  cta_secondary_href TEXT,
  hero_media_kind TEXT NOT NULL DEFAULT 'image',
  hero_image_url TEXT,
  hero_video_url TEXT,
  hero_video_poster_url TEXT,
  logo_image_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  seo_og_image_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_page_revision (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL REFERENCES cms_page(slug) ON DELETE CASCADE,
  updated_by_role admin_role NOT NULL,
  snapshot JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_banner (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  headline TEXT NOT NULL,
  cta_label TEXT,
  cta_href TEXT,
  image_url TEXT NOT NULL,
  status cms_publication_status NOT NULL DEFAULT 'draft',
  publish_at TIMESTAMPTZ,
  display_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_media_asset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  kind TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  poster_image_url TEXT,
  folder TEXT NOT NULL DEFAULT 'general',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS catalogue_product (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status cms_publication_status NOT NULL DEFAULT 'draft',
  category TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  gallery_urls TEXT[] NOT NULL DEFAULT '{}',
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  allergens TEXT[] NOT NULL DEFAULT '{}',
  nutrition_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  pack_formats JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
