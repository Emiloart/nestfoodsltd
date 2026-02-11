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
  hero_image_url TEXT,
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
  folder TEXT NOT NULL DEFAULT 'general',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_product_model (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status cms_publication_status NOT NULL DEFAULT 'draft',
  image_url TEXT NOT NULL,
  nutrition_summary TEXT NOT NULL,
  allergens TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_recipe_model (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status cms_publication_status NOT NULL DEFAULT 'draft',
  image_url TEXT NOT NULL,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
