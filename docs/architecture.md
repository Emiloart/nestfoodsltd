# Architecture Blueprint

## Target Shape

- `apps/web`: customer-facing experience and initial admin surface.
- Future split:
  - `apps/admin`: dedicated operations dashboard (if separated later).
  - `packages/ui`: shared design system.
  - `packages/domain`: business logic (catalog, orders, traceability, B2B).
  - `packages/config`: shared lint/ts/format configs.

## Runtime Model

- Frontend: Next.js App Router with server-first rendering.
- Data: PostgreSQL + Prisma.
- Content: dynamic CMS layer (current JSON-backed store, Payload/DB migration path).
- Payments: adapter layer for Paystack and Flutterwave.
- Media: Cloudinary or equivalent CDN-backed optimizer.

## Security Baseline

- RBAC across admin actions.
- Audit logs for sensitive events.
- Webhook signature validation for payment providers.
- Rate limiting for auth, checkout, and traceability endpoints.

## Internationalization Baseline

- Default locale: `en-NG`.
- Locale-aware route strategy prepared for Hausa/Yoruba/Igbo and French expansion.
- Currency model centered on `NGN` with exchange-ready adapter.
