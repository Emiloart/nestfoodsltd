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
- Content: dynamic CMS layer with JSON storage driver and PostgreSQL migration path.
- Payments: adapter layer for Paystack and Flutterwave.
- Media: Cloudinary or equivalent CDN-backed optimizer.
- Commerce: cart quote engine + checkout + order timeline + subscriptions foundation.
- Customer: session-based profile, wishlist, preferences, personalization, and autocomplete APIs.
- B2B: distributor account approval flow, tiered pricing catalog, quote-to-order conversion, and invoice/statement APIs.
- Traceability: batch ingestion, QR/code lookup, and timeline journey APIs with JSON storage driver.
- Recipes: ingredient search and nutrition bundle calculator APIs backed by recipe + catalog data.
- SEO: canonical metadata helpers, dynamic sitemap, and robots hardening for sensitive paths.
- Performance telemetry: Core Web Vitals budget reporting (`LCP`, `INP`, `CLS`) via client reporter + API ingestion.

## Security Baseline

- RBAC across admin actions.
- Signed session-token model for admin/customer/B2B cookies with expiry and server-side verification.
- Trusted-origin enforcement on sensitive state-changing routes.
- In-memory rate limits on auth, checkout, and traceability lookup routes.
- Audit logs for sensitive events with role, IP, user-agent, and outcome metadata.
- NDPR consent and data-request APIs with consent persistence and request intake workflow.
- Webhook signature validation for payment providers.

## Internationalization Baseline

- Default locale: `en-NG`.
- Locale-aware route strategy prepared for Hausa/Yoruba/Igbo and French expansion.
- Currency model centered on `NGN` with exchange-ready adapter.
- Client-side locale/currency switcher with persistent cookies/local storage.

## Experience Quality Baseline

- Accessibility: skip-to-content, keyboard focus rings, semantic nav labels, improved mobile nav dialog semantics.
- Media: responsive `next/image` usage for primary placeholders and logo surfaces.
- Structured data: Organization (global), FAQ (home), Product (detail), Article (blog list/detail).
