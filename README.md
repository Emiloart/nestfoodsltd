# Nest Foods Ltd Platform

Corporate website foundation for Nest Foods Ltd. The public product is intentionally limited to a manufacturer-first experience: homepage, product catalogue, production standards within the homepage, about, vision, careers, contact, and a restrained enquiry path.

## Stack

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
│  └─ web/                # Public website + host-gated admin surface
├─ docs/                  # Product, admin, and operational notes
├─ CHECKLIST.md           # Build checklist
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
3. Run the public app:
   - `pnpm dev`
4. Enable admin editing when needed:
   - copy `.env.example` to `.env.local`
   - set `ADMIN_TOKEN_SUPER_ADMIN`
   - set `ADMIN_APP_HOSTS` for the host-gated admin surface
5. Verify routes:
   - public site: `http://localhost:3000`
   - admin login: `http://admin.localhost:3000/admin/login`

## Current Product Scope

- Public IA:
  - `/` Home
  - `/shop` Products
  - `/products/[slug]` Product details
  - `/about`
  - `/vision`
  - `/careers`
  - `/contact`
- Product pages focus on descriptions, pack sizes, ingredients, allergens, and direct enquiry paths.
- The admin surface remains host-gated for content and operational management.
- Legacy commerce, portal, customer, and traceability modules may still exist in the codebase, but they are not part of the intended public website direction.

## Current Progress

- Manufacturer-first public shell and homepage are in place.
- Product catalogue and product detail routes have been simplified for a corporate website posture.
- Production standards are presented as homepage content rather than a feature-heavy public module.
- Legacy distributor and traceability routes now redirect to core public pages.
- Core CMS-managed pages remain editable through the admin surface.
- Chat assistant scope is aligned to product, company, enquiry, and careers guidance.
- SEO foundations remain in place through metadata, sitemap generation, and structured data.

## Build Hygiene

- Production build should be validated on Node.js `22.14+`.
- Run `pnpm lint` and `pnpm typecheck` before release work.
- Generated runtime artifacts such as `.next-dev*.log` and `apps/web/tsconfig.tsbuildinfo` should remain local-only.
- Telemetry state in `apps/web/data/observability.json` is runtime data, not release content.
- `AUTH_SECRET` is required in production.

## Immediate Cleanup Direction

1. Continue archiving or deprecating legacy commerce, customer, B2B portal, and traceability modules that are no longer part of the public site.
2. Keep public copy focused on manufacturing credibility, products, company story, careers, and contact.
3. Use placeholders only for media, not public-facing business copy.

## GitHub Setup

```bash
git init
git add .
git commit -m "chore: scaffold nestfoodsltd corporate website foundation"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```
