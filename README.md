# Nest Foods Ltd Platform

Build-ready manufacturer platform for Nest Foods Ltd with a bread-first public experience, secured admin tooling, commerce workflows, B2B distributor support, and traceability.

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
│  └─ web/                # Public website + isolated admin surface (host-gated)
├─ CHECKLIST.md           # Master enterprise build checklist
├─ .env.example           # Environment contract
├─ package.json           # Workspace scripts
└─ pnpm-workspace.yaml
```

## Quick Start

1. Install prerequisites:
   - Node.js `22.14+`
   - pnpm `10.x`
2. Install dependencies:
   - `pnpm install`
   - if your network is unstable, retry with `pnpm install --registry=https://registry.npmmirror.com --no-optional`
3. Run dev server:
   - `pnpm dev`
4. Enable admin edits:
   - copy `.env.example` to `.env.local`
   - set at least `ADMIN_TOKEN_SUPER_ADMIN`
   - set `ADMIN_APP_HOSTS` (for local dev use `admin.localhost:3000`)
5. Sign in to admin:
   - open `http://admin.localhost:3000/admin/login`
   - use one configured role token
6. Verify separation:
   - public site: `http://localhost:3000`
   - admin site: `http://admin.localhost:3000/admin/login`

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
- Admin surface is isolated by host (`ADMIN_APP_HOSTS`) so public site navigation no longer exposes admin routes.
- Performance/accessibility/SEO hardening is live (WCAG-focused critical flow upgrades, Core Web Vitals budgets + telemetry endpoint, canonical metadata, robots/sitemap expansion, and structured data).
- Blog editorial foundation now includes index/detail routes with metadata and Article schema coverage.
- DevOps/release operations foundations are live (CI quality gates, preview/staging/production deploy workflows, environment templates, release + launch runbooks).
- SUPER_ADMIN operations dashboard is live (`/admin/ops`) with web-vitals and runtime error telemetry summaries.
- Chat Agent v1 is live as a floating assistant widget (grounded intent responses + lead handoff).
- Admin user management v1 is live (`/admin/users`) with invite activation, managed credentials, MFA policy, and break-glass token fallback.
- Public IA now presents Nest Foods as a premium bread manufacturer first, with mobile-first homepage flows, lighter footer density, and traceability surfaced as a public trust layer.
- Production build cleanup now includes local-safe typography, server-side admin page guards, and signed-session-only customer/B2B cookie reads.

## Build Hygiene

- Production build has been validated on Node.js `22.14+`.
- Full TypeScript validation passes on Node.js `22.14+`.
- Generated runtime artifacts such as `.next-dev*.log` and `apps/web/tsconfig.tsbuildinfo` should remain local-only.
- Telemetry state in `apps/web/data/observability.json` is runtime data, not release content.
- `AUTH_SECRET` is required in production; the development fallback secret is no longer accepted there.

## Next Build Steps

1. Execute `apps/admin` split migration (`docs/admin-app-split-plan.md`).
2. Upgrade admin MFA from static code to authenticator TOTP.
3. Add browser security headers (CSP, HSTS, Referrer-Policy, Permissions-Policy).
4. Harden customer auth to user-id based identity provider (NextAuth/Clerk).
5. Implement inventory locking and transactional checkout.

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
