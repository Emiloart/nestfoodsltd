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
3. Run dev server:
   - `pnpm dev`

## Current Progress

- Foundation checklist created in `CHECKLIST.md`.
- Monorepo scaffolded.
- Next.js app shell created with responsive dark/light mode support.
- Design system baseline completed (tokens + UI primitives + motion foundations).
- Core route placeholders added for all major product areas.

## Next Build Steps

1. Stand up CMS/admin and role-based access.
2. Implement product catalog domain schema and API.
3. Build cart + checkout + payment provider adapters.
4. Add B2B portal and traceability workflows.
5. Add traceability data ingestion + consumer lookup.

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
