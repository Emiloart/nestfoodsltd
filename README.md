# De-Nest Bread Corporate Website

Corporate website for Nest Foods Limited, using De-Nest Bread as the public brand.

This project is not an online sales platform. The public site is limited to company credibility, bread product information, production standards, about, careers, contact, privacy, terms, WhatsApp-first contact, newsletter capture, and simple enquiry forms.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- pnpm workspaces

## Public Routes

- `/`
- `/products`
- `/products/[slug]`
- `/about`
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
- image and gallery media
- ingredients
- allergens
- nutrition notes
- pack or size formats
- best-for cues
- shelf-life and storage guidance

Seeded products from the cleaned PDF source:

- De-Nest Family Jumbo Bread
- De-Nest Family Loaf Bread
- De-Nest Sliced Bread
- De-Nest Midi Bread
- De-Nest Mini Bread

## Admin Scope

The admin surface is host-gated and keeps only the modules needed for a corporate website:

- content pages
- company controls for contacts, socials, About, careers, branches, trust text, and FAQ
- homepage banners with images, publishing state, order, and action links
- media library
- product catalogue with direct product-photo uploads
- admin users and access-token rotation
- audit events
- operations overview

## Public Lead Capture

The website captures enquiries only. It does not create transactional fulfilment workflows.

- `/api/newsletter/subscribe`
- `/api/enquiries/bulk`
- `/api/enquiries/distributor`
- `/api/careers/apply`

Local storage defaults to JSON files. Production should use Postgres-compatible storage drivers for CMS, company content, catalogue, privacy, newsletter, enquiry, careers, admin users, and audit persistence when `DATABASE_URL` is configured. For Neon, set `COMPANY_STORAGE_DRIVER=postgres` alongside the other `*_STORAGE_DRIVER=postgres` values.

Transactional email is sent server-side when configured. Set `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, and the notification inbox variables in production. Supply, business-interest, newsletter, and career submissions send an internal notification plus a confirmation email to the submitted email address when available.

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
