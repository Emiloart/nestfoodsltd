# B2B / Distributor Portal Foundations

## Scope Delivered

- B2B distributor session flow (`email + company + contact`) with approval-state handling.
- Separate B2B account profile APIs and account-manager contact endpoint.
- Tiered B2B catalog pricing derived from commerce variants.
- Bulk quote builder + quote preview + quote submission.
- Quote lifecycle management with admin status updates.
- Quote-to-order conversion for approved/quoted requests.
- B2B order tracking timelines.
- Invoice and statement endpoints with download hooks.
- Support ticket channel for distributor-to-account-manager escalation.

## Data Sources

- Seed + runtime JSON store:
  - `apps/web/data/b2b.json`
  - `apps/web/lib/b2b/store.ts`
  - `apps/web/lib/b2b/seed.ts`
  - `apps/web/lib/b2b/service.ts`

## APIs

- Session/account:
  - `GET|POST|DELETE /api/b2b/session`
  - `GET|PUT /api/b2b/account`
  - `GET /api/b2b/account-manager`
- Catalog/quote/order:
  - `GET /api/b2b/catalog`
  - `POST /api/b2b/quotes/preview`
  - `GET|POST /api/b2b/quotes`
  - `GET /api/b2b/quotes/[id]`
  - `POST /api/b2b/quotes/[id]/convert-order`
  - `GET /api/b2b/orders`
- Finance/support:
  - `GET /api/b2b/invoices`
  - `GET /api/b2b/invoices/[id]/download`
  - `GET /api/b2b/statements`
  - `GET|POST /api/b2b/support/tickets`
- Admin operations (sales manager/super admin):
  - `GET /api/b2b/admin/accounts`
  - `PUT /api/b2b/admin/accounts/[id]/approval`
  - `PUT /api/b2b/admin/quotes/[id]/status`

## UI Surface

- `apps/web/app/b2b/page.tsx`
- `apps/web/components/b2b/b2b-page-client.tsx`

## Production Hardening Next

- Move B2B data from JSON driver to PostgreSQL.
- Add legal/compliance checks per distributor country.
- Add invoice PDF generation and signed downloadable documents.
- Add B2B payment terms engine + credit limit controls.
