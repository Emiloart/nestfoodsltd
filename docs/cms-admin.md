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
- product catalog management (products, variants, nutrition, allergens, ingredients)
- recipe management (draft/publish, ingredients, nutrition, related products)
- order control (lifecycle updates + payment webhook visibility)

## Data + Services

- Services:
  - `apps/web/lib/cms/service.ts`
  - `apps/web/lib/commerce/service.ts`
  - `apps/web/lib/recipes/service.ts`
- Storage drivers:
  - local JSON seed/data files for development
  - Postgres-backed JSONB module store when `*_STORAGE_DRIVER=postgres`
- API routes:
  - `GET https://admin.<domain>/api/cms/pages`
  - `GET https://admin.<domain>/api/cms/pages/[slug]`
  - `PUT https://admin.<domain>/api/cms/pages/[slug]`
  - `GET https://admin.<domain>/api/admin/cms/banners`
  - `POST https://admin.<domain>/api/admin/cms/banners`
  - `GET https://admin.<domain>/api/admin/cms/banners/[id]`
  - `PUT https://admin.<domain>/api/admin/cms/banners/[id]`
  - `DELETE https://admin.<domain>/api/admin/cms/banners/[id]`
  - `GET https://admin.<domain>/api/admin/catalog/products`
  - `POST https://admin.<domain>/api/admin/catalog/products`
  - `GET https://admin.<domain>/api/admin/catalog/products/[id]`
  - `PUT https://admin.<domain>/api/admin/catalog/products/[id]`
  - `DELETE https://admin.<domain>/api/admin/catalog/products/[id]`
  - `GET https://admin.<domain>/api/admin/cms/media`
  - `POST https://admin.<domain>/api/admin/cms/media`
  - `GET https://admin.<domain>/api/admin/cms/media/[id]`
  - `PUT https://admin.<domain>/api/admin/cms/media/[id]`
  - `DELETE https://admin.<domain>/api/admin/cms/media/[id]`
  - `GET https://admin.<domain>/api/admin/cms/recipes`
  - `POST https://admin.<domain>/api/admin/cms/recipes`
  - `GET https://admin.<domain>/api/admin/cms/recipes/[id]`
  - `PUT https://admin.<domain>/api/admin/cms/recipes/[id]`
  - `DELETE https://admin.<domain>/api/admin/cms/recipes/[id]`
  - `GET https://admin.<domain>/api/admin/orders`
  - `GET https://admin.<domain>/api/admin/orders/[id]`
  - `PUT https://admin.<domain>/api/admin/orders/[id]`
  - `GET https://admin.<domain>/api/admin/orders/webhooks`
  - `POST https://admin.<domain>/api/admin/session`
  - `GET https://admin.<domain>/api/admin/session`
  - `DELETE https://admin.<domain>/api/admin/session`

## Admin Security

- Admin login sets signed secure session cookie (`nest_admin_token`).
- RBAC roles: `SUPER_ADMIN`, `CONTENT_EDITOR`, `SALES_MANAGER`.
- Write operations require role permission checks.
- Set role tokens in `.env.local` (`ADMIN_TOKEN_*`).
- Admin surface is host-gated via `ADMIN_APP_HOSTS`.
- Admin write routes enforce trusted request origins and audit event logging.
- Admin editor route: `https://admin.<domain>/admin/content`.
- Admin banner route: `https://admin.<domain>/admin/banners`.
- Admin catalog route: `https://admin.<domain>/admin/catalog`.
- Admin media route: `https://admin.<domain>/admin/media`.
- Admin recipes route: `https://admin.<domain>/admin/recipes`.
- Admin order route: `https://admin.<domain>/admin/orders`.
- Admin user directory route: `https://admin.<domain>/admin/users`.
- Admin login route: `https://admin.<domain>/admin/login`.
- Managed admin identity APIs:
  - `GET https://admin.<domain>/api/admin/users`
  - `PUT https://admin.<domain>/api/admin/users/[id]`
  - `POST https://admin.<domain>/api/admin/users/invites`
  - `DELETE https://admin.<domain>/api/admin/users/invites/[id]`
  - `POST https://admin.<domain>/api/admin/users/invites/activate`

## Notes

- This is an enterprise-ready CMS foundation and is intentionally storage-agnostic.
- Page updates now capture revision history snapshots.
- Pages support draft/published/scheduled status and per-page SEO fields.
- Banner manager supports create/edit/delete plus scheduling and display ordering.
- Media manager includes usage reference scanning before deletion.
- Recipe manager validates related product links and normalizes nutrition fields.
- Order control enforces lifecycle transition rules and records timeline notes.
- Admin login now supports managed email/password + MFA (invite-activated) with break-glass token fallback.
