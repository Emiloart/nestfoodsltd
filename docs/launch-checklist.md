# Launch Checklist

## Content

- [ ] Public brand reads De-Nest Bread.
- [ ] Legal contexts read Nest Foods Limited.
- [ ] Product catalogue includes the four cleaned PDF products.
- [ ] Contact page includes phones, emails, WhatsApp numbers, contact locations, and social placeholders.
- [ ] Careers page includes HR email, HR phone, roles, application guidance, and equal opportunity statement.
- [ ] Terms and privacy copy reviewed by the business.

## Technical

- [ ] `pnpm --filter @nestfoodsltd/web typecheck`
- [ ] `pnpm --filter @nestfoodsltd/web build`
- [ ] Sitemap contains only approved public pages and product detail pages.
- [ ] Admin dashboard links only to retained modules.
- [ ] Catalogue manager exposes only corporate catalogue fields.
- [ ] Privacy preference save works from banner and privacy page.
- [ ] Mobile nav and footer match the simplified route map.

## Media

- [ ] Hero poster is present.
- [ ] Hero video is compressed, muted, looped, and self-hosted if used.
- [ ] Product images use placeholders until final assets are available.

## Deployment

- [ ] `AUTH_SECRET` is set.
- [ ] Admin hosts are configured.
- [ ] Storage driver choices are confirmed.
- [ ] Error monitoring and web vitals intake are reviewed.
