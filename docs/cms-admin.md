# CMS Admin Editing

## Scope

Current CMS core manages dynamic page content for:

- `home`
- `about`
- `vision`
- `contact`
- `careers`
- `sustainability`

Also modeled for admin control:

- banners
- media assets
- product model placeholders
- recipe model placeholders

## Data Store

- Source file: `apps/web/data/cms.json`
- Service layer: `apps/web/lib/cms/service.ts`
- API routes:
  - `GET /api/cms/pages`
  - `GET /api/cms/pages/[slug]`
  - `PUT /api/cms/pages/[slug]`
  - `POST /api/admin/session`
  - `GET /api/admin/session`
  - `DELETE /api/admin/session`

## Admin Security

- Admin login sets secure session cookie (`nest_admin_token`).
- RBAC roles: `SUPER_ADMIN`, `CONTENT_EDITOR`, `SALES_MANAGER`.
- Write operations require role permission checks.
- Set role tokens in `.env.local` (`ADMIN_TOKEN_*`).
- Admin editor route: `/admin/content`.
- Admin login route: `/admin/login`.

## Notes

- This is an enterprise-ready CMS foundation and is intentionally storage-agnostic.
- Page updates now capture revision history snapshots.
- Pages support draft/published/scheduled status and per-page SEO fields.
- Next step is migration to PostgreSQL-backed content tables via `db/postgres/schema.sql`.
