# Launch Checklist

## Content

- [ ] Public brand reads De-Nest Bread.
- [ ] Legal contexts read Nest Foods Limited.
- [ ] Product catalogue includes the approved De-Nest Bread products.
- [ ] Contact page includes phones, emails, WhatsApp numbers, business hours, map link, contact locations, and confirmed social channels.
- [ ] Careers page includes HR email, HR phone, roles, online application form, file attachment guidance, and equal opportunity statement.
- [ ] Terms and privacy copy reviewed by the business.

## Technical

- [ ] `pnpm --filter @nestfoodsltd/web typecheck`
- [ ] `pnpm --filter @nestfoodsltd/web build`
- [ ] Sitemap contains only approved public pages and product detail pages.
- [ ] Admin dashboard links only to retained modules.
- [ ] Catalogue manager exposes only corporate catalogue fields.
- [ ] Privacy preference save works from banner and privacy page.
- [ ] Enquiry, newsletter, and career forms submit online and send automated confirmation emails in production.
- [ ] Mobile nav and footer match the simplified route map.

## Media

- [ ] Hero poster is present.
- [ ] Hero video is compressed, muted, looped, and self-hosted if used.
- [ ] Product images use real assets where available; Midi Bread remains pending by current business decision.
- [ ] Open Graph image uses the real branded hero asset.

## Deployment

- [ ] `AUTH_SECRET` is set.
- [ ] Admin hosts are configured.
- [ ] Storage driver choices are confirmed.
- [ ] Transactional email provider, sender domain, SPF/DKIM/DMARC, and notification inboxes are configured.
- [ ] Error monitoring and web vitals intake are reviewed.
