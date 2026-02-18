# Sprint Plan (Execution Order)

## Day 0 — Foundation (Completed)

- Repository scaffold and quality gates.
- Public route skeleton and premium base layout.
- Checklist and architecture docs.

## Day 1 — Premium UI + Dynamic CMS Core (Completed)

- Implement design tokens and shared components.
- Connect CMS models for pages, banners, products, recipes, media. (Pages completed)
- Wire dynamic home, about, vision, contact content. (Completed)
- Add RBAC admin login and protected admin routes. (Completed)
- Add scheduling/revision/SEO controls for CMS pages. (Completed)

## Day 2 — Commerce MVP (Completed)

- Catalog listing + detail pages (dynamic data).
- Cart + checkout flow foundations.
- Payment initiation with Paystack + Flutterwave stubs.
- Customer auth and account shell.

## Day 3 — Customer Platform (Completed)

- Cookie-based customer session + authenticated profile APIs.
- Wishlist, customer order history, and authenticated reorder flow.
- Preferences center with locale/currency + newsletter/notification controls.
- Personalization rails (recommendations + recently viewed).
- Search autocomplete and faceted shop filters.

## Day 4 — B2B Distributor Portal (Completed)

- B2B session and distributor approval-state flow.
- Tiered pricing catalog and bulk quote builder.
- Quote lifecycle with admin status controls and conversion to orders.
- Invoice/statement download hooks and support ticket channel.

## Day 5 — Traceability + Food Tools (Completed)

- Public batch/QR lookup page with source, processing, certification, and timeline view.
- Admin traceability manager with create, update, and bulk import workflows.
- Recipe finder powered by ingredient-based matching and search.
- Nutrition bundle calculator using live catalog nutrition tables.

## Day 6 — Security, Compliance, Reliability (Completed)

- Signed session-token controls for admin, customer, and B2B auth cookies.
- Trusted-origin enforcement and endpoint rate limits for abuse resistance.
- Security audit event pipeline and SUPER_ADMIN audit viewer.
- NDPR consent manager and data-subject request intake APIs.
- Backup/restore and incident-response runbook documentation.

## Day 7 — Performance, Accessibility, SEO (Completed)

- WCAG hardening on critical flows (skip links, nav semantics, focus states, combobox/listbox search semantics).
- Core Web Vitals budget model (LCP, INP, CLS) with client reporter and telemetry ingestion endpoint.
- Image optimization baseline upgraded to `next/image` responsive behavior for placeholder media and brand surfaces.
- Structured data coverage expanded across Organization, Product, Article, and FAQ schemas.
- Canonical metadata strategy, expanded sitemap, and hardened robots policy for sensitive routes.

## Post Day 7 — Enterprise Rollout

- Full order management and notifications.
- DevOps release automation, observability, and SLA operations.
