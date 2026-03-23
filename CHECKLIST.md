# Nest Foods Ltd — Enterprise Build Checklist

Last updated: 2026-02-20

## 0) Foundation (Start Here)

- [x] Initialize clean monorepo (`pnpm` workspaces + strict TypeScript)
- [x] Scaffold `apps/web` with Next.js App Router + Tailwind + ESLint
- [x] Create shared configs (`tsconfig`, ESLint, Prettier, env template)
- [x] Set up quality gates (lint, typecheck, format, basic CI)
- [x] Define core information architecture + route map

## 1) Design System (Solana-Standard Feel)

- [x] Add design tokens (colors, spacing, typography, radii, shadows)
- [x] Implement light/dark theme with smooth transitions
- [x] Build reusable UI primitives (Button, Input, Card, Modal, Badge)
- [x] Build layout shell (header, mega-nav, footer, mobile nav)
- [x] Add motion foundations (micro-interactions + skeleton loaders)

## 2) CMS/Admin Core (Dynamic Everything)

- Progress: secured admin login + RBAC + dynamic CMS editor is live.
- [x] Set up secure admin app/domain strategy
- [x] Implement RBAC (Super Admin, Content Editor, Sales Manager)
- [x] Build content models (pages, banners, products, recipes, media)
- [x] Add draft/preview, scheduling, and revision history
- [x] Add SEO controls per page + sitemap metadata fields

## 3) Commerce Core (Food Business)

- Progress: commerce APIs + shop/cart/checkout/account foundations are live.
- [x] Product catalog with variants, nutrition, allergens, ingredients
- [x] Cart + checkout (guest + account), promo codes, delivery slots
- [x] Integrate Paystack + Flutterwave (webhooks + retries)
- [x] Order lifecycle + status timeline + reorder flow
- [x] Subscriptions/recurring delivery foundations

## 4) Customer Platform Features

- Progress: customer account, personalization, and locale/currency foundations are live.
- [x] Auth + profile + addresses + wishlist + order history
- [x] Search/autocomplete + faceted filters
- [x] Personalization blocks (recently viewed, recommendations)
- [x] Newsletter preferences + notification preferences
- [x] Multi-language + multi-currency architecture
- [x] Conversational chat assistant v1 (grounded intents + human handoff)

## 5) B2B / Distributor Portal

- Progress: distributor portal foundations with approval, bulk quote-to-order, invoicing, and support are live.
- [x] Separate B2B auth + approval flow
- [x] Bulk order UX + tiered pricing + quote requests
- [x] Invoices/statements download
- [x] B2B order tracking + account manager support hooks

## 6) Traceability + Food-Specific Tools

- Progress: public traceability lookup, admin batch ingestion, recipe finder, and nutrition calculator are live.
- [x] Batch/QR lookup page
- [x] Admin batch data ingestion/editing
- [x] Product journey view (source/process/certification)
- [x] Recipe finder by ingredient
- [x] Nutrition calculator for bundles

## 7) Security, Compliance, Reliability

- Progress: signed session tokens, origin checks, abuse/rate controls, server-side admin page guards, NDPR consent/data-request APIs, and security runbook are live.
- [x] OWASP ASVS-aligned auth/session controls
- [x] Rate limits, bot protection, abuse monitoring
- [x] Audit logs for admin-sensitive actions
- [x] NDPR privacy controls + consent management
- [x] Backups + restore playbook + incident checklist

## 8) Performance + Accessibility + SEO

- Progress: WCAG-focused UX hardening, Core Web Vitals budgets + telemetry intake, image optimization baselines, structured data coverage, and technical SEO hardening are live.
- [x] WCAG 2.2 AA pass on critical flows
- [x] Core Web Vitals budget (LCP, INP, CLS)
- [x] Image optimization pipeline + responsive media
- [x] Structured data (Organization, Product, Article, FAQ)
- [x] Technical SEO hardening (canonical, robots, sitemap)

## 9) DevOps + Release

- Progress: CI/CD deploy pipelines, environment strategy templates, observability dashboarding, and release/launch operations docs are live.
- [x] CI/CD pipelines (preview + production)
- [x] Environment strategy (`dev`, `staging`, `prod`)
- [x] Error monitoring + analytics dashboards
- [x] Runbooks + handover docs
- [x] Launch checklist + post-launch SLA monitoring

## 10) Admin Completion Backlog (Post-Audit)

- Progress: audited admin backlog completed (catalog, banners, media, recipes, order control, storage, payment sessions, and migration plans).
- [x] Catalog Manager v1 (admin CRUD for products, variants, nutrition, allergens, ingredients)
- [x] Banner Manager v1 (create/edit/schedule/order hero banners)
- [x] Media Library v1 (asset metadata manager + usage references)
- [x] Recipe Manager v1 (create/edit/publish recipe content)
- [x] Order Control v1 (admin lifecycle updates + payment event visibility)
- [x] Admin user management v1 (directory, invite activation, managed login, MFA policy)
- [x] Separate `apps/admin` app split plan + migration checklist
- [x] Postgres storage drivers for admin-critical modules
- [x] Replace mock payment sessions with live provider flows

## Immediate execution order

1. Foundation scaffold
2. Design system baseline
3. Public site skeleton pages
4. Admin content models + dynamic rendering bridge
5. Commerce + payments integration
