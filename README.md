# Nest Foods Ltd Platform

Enterprise-grade, modern web platform foundation for Nest Foods Ltd with a premium UX baseline and scalable architecture.

## Stack (Foundation)

- `Next.js 16` (App Router)
- `React 19`
- `TypeScript` (strict)
- `Tailwind CSS 4`
- `Framer Motion`
- `pnpm` workspaces monorepo structure

## Repo Structure

```txt
.
├─ apps/
│  └─ web/                # Public website + future admin surface
├─ CHECKLIST.md           # Master enterprise build checklist
├─ .env.example           # Environment contract
├─ package.json           # Workspace scripts
└─ pnpm-workspace.yaml
```

## Quick Start

1. Install prerequisites:
   - Node.js `24.x` (Active LTS)
   - pnpm `10.x`
2. Install dependencies:
   - `pnpm install`
   - if your network is unstable, retry with `pnpm install --registry=https://registry.npmmirror.com --no-optional`
3. Run dev server:
   - `pnpm dev`
4. Enable admin edits:
   - copy `.env.example` to `.env.local`
   - set at least `ADMIN_TOKEN_SUPER_ADMIN`
5. Sign in to admin:
   - open `/admin/login`
   - use one configured role token

## Current Progress

- Foundation checklist created in `CHECKLIST.md`.
- Monorepo scaffolded.
- Next.js app shell created with responsive dark/light mode support.
- Design system baseline completed (tokens + UI primitives + motion foundations).
- Core route placeholders added for all major product areas.
- Dynamic CMS core added for key pages with secured admin editing API.
- RBAC session login and protected admin routes are active.
- CMS model now includes publication status, scheduling, SEO fields, and revisions.
- Logo and image placeholders are wired in homepage and product sections.
- Commerce core foundations are live (catalog, cart, checkout, orders, subscriptions, payment adapters).
- Customer platform foundations are live (session auth, profile/preferences, wishlist, order history, personalization, search autocomplete).
- B2B distributor portal foundations are live (approval flow, tiered pricing catalog, bulk quotes, quote-to-order conversion, invoices/statements, support tickets).
- Traceability and food-tooling foundations are live (batch lookup timeline, admin batch ingestion, recipe finder, nutrition calculator).
- Security/compliance foundations are live (signed sessions, rate limits, audit events, NDPR consent + data request flows).
- Security operations runbook is documented in `docs/security-operations.md`.
- Performance/accessibility/SEO hardening is live (WCAG-focused critical flow upgrades, Core Web Vitals budgets + telemetry endpoint, canonical metadata, robots/sitemap expansion, and structured data).
- Blog editorial foundation now includes index/detail routes with metadata and Article schema coverage.
- DevOps/release operations foundations are live (CI quality gates, preview/staging/production deploy workflows, environment templates, release + launch runbooks).
- SUPER_ADMIN operations dashboard is live (`/admin/ops`) with web-vitals and runtime error telemetry summaries.

## Next Build Steps

1. Move CMS + commerce + customer storage drivers from JSON to PostgreSQL adapters.
2. Harden customer auth to user-id based identity provider (NextAuth/Clerk).
3. Implement inventory locking and transactional checkout.
4. Add persistent analytics/error sinks (Sentry + GA4/Plausible) and alert routing.
5. Finalize launch sign-off against `docs/launch-checklist.md`.

## GitHub Setup

After creating your GitHub repo:

```bash
git init
git add .
git commit -m "chore: scaffold nestfoodsltd enterprise foundation"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```
