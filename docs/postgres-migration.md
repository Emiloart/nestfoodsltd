# PostgreSQL Migration Path (CMS/Admin)

## Current State

- Runtime storage driver is JSON (`apps/web/data/cms.json`) for rapid iteration.
- RBAC, scheduling, SEO fields, and revision history are already in the domain model.

## SQL Foundation

- Initial schema is defined in `db/postgres/schema.sql`.
- Tables include:
  - `cms_page`
  - `cms_page_revision`
  - `cms_banner`
  - `cms_media_asset`
  - `cms_product_model`
  - `cms_recipe_model`

## Migration Steps

1. Create PostgreSQL database and run `db/postgres/schema.sql`.
2. Set `CMS_STORAGE_DRIVER=postgres` in `.env.local`.
3. Implement storage adapter switch in `apps/web/lib/cms/store.ts`.
4. Add migration script to copy JSON seed data into PostgreSQL.
5. Add transaction-safe writes for page updates and revisions.

## Production Notes

- Keep JSON driver for local fallback only.
- Use managed Postgres with automated backups.
- Add per-table audit columns and change events before enterprise launch.
