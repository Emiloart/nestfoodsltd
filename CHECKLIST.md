# De-Nest Bread Corporate Website Checklist

Last updated: 2026-05-05

## Public Scope

- [x] Public brand set to De-Nest Bread.
- [x] Legal company name retained as Nest Foods Limited.
- [x] Public navigation limited to Home, Products, About, Vision, Careers, and Contact.
- [x] Products remain a catalogue with product detail pages and enquiry CTA only.
- [x] Sitemap limited to approved public routes and product detail pages.

## Content

- [x] Homepage order: hero, trust strip, product range, production standards, about, vision, careers, contact.
- [x] Product catalogue seeded from the cleaned PDF facts.
- [x] Contact page includes official phones, emails, WhatsApp numbers, office contacts, and social placeholders.
- [x] Careers page includes roles, HR contact, equal opportunity statement, and application guidance.
- [x] About and Vision pages use cleaned company, mission, compliance, and values content.

## Admin

- [x] Admin modules retained for content, banners, media, catalogue, users, audit, and operations.
- [x] Catalogue manager limited to corporate product fields.
- [x] Removed old operational product fields from admin catalogue editing.
- [x] Host-gated admin surface preserved.

## Media

- [x] Hero supports image or short self-hosted video.
- [x] Hero video has poster fallback and static fallback for reduced motion, mobile, and constrained connections.
- [x] Product cards remain image-first.
- [x] Placeholder media paths are preserved.

## Privacy

- [x] Consent banner and privacy page submit preferences through `/api/privacy/consent`.
- [x] Data request form remains available on the privacy page.

## Verification

- [ ] Run `pnpm --filter @nestfoodsltd/web typecheck`.
- [ ] Run `pnpm --filter @nestfoodsltd/web build`.
- [ ] Review key pages on desktop and mobile.
