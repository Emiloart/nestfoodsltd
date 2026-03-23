# PostgreSQL Migration Path (CMS/Admin)

## Current State

- Runtime storage supports `json` and `postgres` drivers per module.
- Admin-critical modules can persist via Postgres JSONB through `apps/web/lib/storage/postgres-json.ts`.
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
2. Set module drivers to `postgres` in environment config (`*_STORAGE_DRIVER`).
3. Ensure `DATABASE_URL` is configured for the runtime.
4. Add migration script to copy JSON seed data into PostgreSQL for existing deployments.
5. Add transaction-safe writes and typed relational schemas for high-volume entities.

## Production Notes

- Keep JSON driver for local fallback and disaster-recovery export.
- Use managed Postgres with automated backups.
- Add per-table audit columns and change events before full relational cutover.
