# Customer Platform Foundations

## Scope Delivered

- Session-based customer sign-in (`email` + cookie session).
- Profile management (name, phone, multiple addresses).
- Wishlist management with save/remove product actions.
- Order history, subscriptions, and authenticated reorder flow.
- Preferences center for locale, currency, newsletter, and notifications.
- Personalization rails (recently viewed + recommendations).
- Autocomplete search API (products, categories, recipes).

## Data Sources

- Seed + runtime JSON store:
  - `apps/web/data/customer.json`
  - `apps/web/lib/customer/store.ts`
  - `apps/web/lib/customer/seed.ts`
  - `apps/web/lib/customer/service.ts`

## APIs

- Session/profile/preferences:
  - `GET|POST|DELETE /api/customer/session`
  - `GET|PUT /api/customer/profile`
  - `GET|PUT /api/customer/preferences`
- Commerce-linked customer endpoints:
  - `GET /api/customer/orders`
  - `POST /api/customer/orders/[id]/reorder`
  - `GET /api/customer/subscriptions`
  - `GET|POST|DELETE /api/customer/wishlist`
- Personalization and discovery:
  - `GET /api/customer/search`
  - `GET /api/customer/recommendations`
  - `GET|POST /api/customer/recently-viewed`

## UI Surfaces

- `apps/web/app/account/page.tsx`
- `apps/web/components/account/account-page-client.tsx`
- `apps/web/components/customer/global-search.tsx`
- `apps/web/components/customer/locale-currency-switcher.tsx`
- `apps/web/components/customer/personalized-rail.tsx`
- `apps/web/components/customer/add-to-wishlist-button.tsx`

## Production Hardening Next

- Replace cookie-email session with NextAuth/Clerk and secure user IDs.
- Encrypt customer PII at rest and add audit logs for profile updates.
- Add anti-abuse rate limits for session/search endpoints.
- Move customer store driver from JSON to PostgreSQL.
