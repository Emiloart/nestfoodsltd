# Performance, Accessibility, and SEO Hardening

## Scope Completed

- WCAG-focused upgrades on critical flows:
  - skip-to-content link in root layout
  - stronger keyboard focus states for primary nav actions
  - semantic labels for header/footer/mobile navigation
  - improved search combobox/listbox semantics
- Core Web Vitals budget model with telemetry intake:
  - budgets: `LCP <= 2500`, `INP <= 200`, `CLS <= 0.1`
  - client reporter: `apps/web/components/performance/web-vitals-reporter.tsx`
  - API intake: `apps/web/app/api/telemetry/web-vitals/route.ts`
- Media baseline:
  - `next/image` responsive handling for image placeholders and brand logo
  - `next.config.ts` image device sizes and remote patterns
- Technical SEO:
  - canonical metadata helper (`apps/web/lib/seo/metadata.ts`)
  - site URL utility (`apps/web/lib/seo/site.ts`)
  - expanded dynamic sitemap (`apps/web/app/sitemap.ts`)
  - robots disallow rules for sensitive routes (`apps/web/app/robots.ts`)
- Structured data:
  - Organization (global layout)
  - FAQ (home)
  - Product (product detail)
  - Article (blog listing + blog detail)

## Notes

- Current telemetry endpoint is ingestion-first (JSON response + over-budget logging).
- Budget history persistence can be added in the observability phase (Section 9).
