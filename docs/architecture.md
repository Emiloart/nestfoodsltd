# Architecture

## Application

- `apps/web` contains the public corporate website and host-gated admin surface.
- Public content is rendered with Next.js App Router.
- Shared UI primitives live in `apps/web/components/ui`.
- CMS-backed pages, banners, media, and hero media settings live under `apps/web/lib/cms`.
- Product catalogue data lives under `apps/web/lib/catalog`.

## Public Website

The public website exposes only the corporate routes listed in `docs/route-map.md`.

The homepage order is:

- Hero with image or short video support
- Trust strip
- Product range
- Production standards
- About
- Vision
- Careers
- Contact

## Admin Surface

Admin routes are protected by:

- admin host allow-list
- signed admin session cookie
- role permissions
- origin checks on writes
- audit logging

Retained admin modules:

- content pages
- banners
- media
- catalogue
- users
- audit
- operations

## Storage

The app currently supports JSON storage drivers for local development and Postgres JSON storage for deployable persistence.

Current data files:

- `apps/web/data/cms.json`
- `apps/web/data/catalog.json`
- `apps/web/data/chat.json`
- `apps/web/data/privacy.json`
- `apps/web/data/audit-log.json`
- `apps/web/data/admin-users.json`
- `apps/web/data/observability.json`

## SEO

- Metadata is generated per page.
- Sitemap includes approved public routes and product detail pages.
- Structured data includes Organization and Product schemas.
