# CMS Admin Editing

## Scope

Current CMS core manages dynamic page content for:

- `home`
- `about`
- `vision`
- `contact`
- `careers`
- `sustainability`

## Data Store

- Source file: `apps/web/data/cms.json`
- Service layer: `apps/web/lib/cms/service.ts`
- API routes:
  - `GET /api/cms/pages`
  - `GET /api/cms/pages/[slug]`
  - `PUT /api/cms/pages/[slug]`

## Admin Security

- Write operations require `x-admin-token` header.
- Set `ADMIN_API_TOKEN` in `.env.local`.
- Admin editor route: `/admin/content`.

## Notes

- This is an enterprise-ready CMS foundation and is intentionally storage-agnostic.
- Next step is migration to PostgreSQL-backed content tables with revision history, scheduling, and RBAC.
