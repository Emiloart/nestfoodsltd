# De-Nest Bread Corporate Website

Corporate website for Nest Foods Limited, using De-Nest Bread as the public brand.

This project is not an online sales platform. The public site is limited to company credibility, bread product information, production standards, about, vision, careers, contact, privacy, and terms.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- pnpm workspaces

## Public Routes

- `/`
- `/shop`
- `/products/[slug]`
- `/about`
- `/vision`
- `/careers`
- `/contact`
- `/privacy`
- `/terms`

## Product Catalogue

Products are managed as catalogue entries only. Public and admin product fields are limited to:

- name
- slug
- status
- category
- short and detailed descriptions
- image and gallery placeholders
- ingredients
- allergens
- nutrition notes
- pack or size formats

Seeded products from the cleaned PDF source:

- De-Nest Family Jumbo Bread
- De-Nest Family Loaf Bread
- De-Nest Midi Bread
- De-Nest Mini Bread

## Admin Scope

The admin surface is host-gated and keeps only the modules needed for a corporate website:

- content pages
- banners
- media library
- product catalogue
- admin users
- audit events
- operations overview

## Quick Start

1. Install Node.js `22.14+`.
2. Install dependencies with `pnpm install`.
3. Start the app with `pnpm dev`.
4. Copy `.env.example` to `.env.local` and set admin secrets when using `/admin`.

## Verification

```bash
pnpm --filter @nestfoodsltd/web typecheck
pnpm --filter @nestfoodsltd/web build
```
