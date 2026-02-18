# Nest Foods Ltd — Enterprise Build Checklist

Last updated: 2026-02-18

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

- Progress: signed session tokens, origin checks, abuse/rate controls, NDPR consent/data-request APIs, and security runbook are live.
- [x] OWASP ASVS-aligned auth/session controls
- [x] Rate limits, bot protection, abuse monitoring
- [x] Audit logs for admin-sensitive actions
- [x] NDPR privacy controls + consent management
- [x] Backups + restore playbook + incident checklist

## 8) Performance + Accessibility + SEO

- [ ] WCAG 2.2 AA pass on critical flows
- [ ] Core Web Vitals budget (LCP, INP, CLS)
- [ ] Image optimization pipeline + responsive media
- [ ] Structured data (Organization, Product, Article, FAQ)
- [ ] Technical SEO hardening (canonical, robots, sitemap)

## 9) DevOps + Release

- [ ] CI/CD pipelines (preview + production)
- [ ] Environment strategy (`dev`, `staging`, `prod`)
- [ ] Error monitoring + analytics dashboards
- [ ] Runbooks + handover docs
- [ ] Launch checklist + post-launch SLA monitoring

## Immediate execution order

1. Foundation scaffold
2. Design system baseline
3. Public site skeleton pages
4. Admin content models + dynamic rendering bridge
5. Commerce + payments integration
