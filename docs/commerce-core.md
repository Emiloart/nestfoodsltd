# Commerce Core Foundations

## Scope Delivered

- Product catalog domain with variants, allergens, ingredients, and nutrition tables.
- Cart quote engine with promo code and delivery slot fee support.
- Checkout flow with provider selection (`paystack` or `flutterwave`).
- Order timeline model with reorder endpoint.
- Subscription listing foundation.
- Payment initiation and webhook processing with retry intent signaling.

## Data Sources

- Seed + runtime JSON store:
  - `apps/web/data/commerce.json`
  - `apps/web/lib/commerce/store.ts`
  - `apps/web/lib/commerce/seed.ts`
  - `apps/web/lib/commerce/service.ts`

## APIs

- Catalog:
  - `GET /api/commerce/products`
  - `GET /api/commerce/products/[slug]`
- Cart/checkout:
  - `POST /api/commerce/cart/quote`
  - `GET /api/commerce/delivery-slots`
  - `POST /api/commerce/checkout`
- Payments:
  - `POST /api/commerce/payments/paystack/initiate`
  - `POST /api/commerce/payments/flutterwave/initiate`
  - `POST /api/commerce/payments/webhook/[provider]`
- Orders/subscriptions:
  - `GET /api/commerce/orders`
  - `GET /api/commerce/orders/[id]`
  - `POST /api/commerce/orders/[id]/reorder`
  - `GET /api/commerce/subscriptions`

## UI Surfaces

- `apps/web/app/shop/page.tsx`
- `apps/web/app/products/[slug]/page.tsx`
- `apps/web/app/cart/page.tsx`
- `apps/web/app/checkout/page.tsx`
- `apps/web/app/account/page.tsx`

## Production Hardening Next

- Move commerce storage driver to PostgreSQL.
- Add authenticated customer accounts for order ownership.
- Add webhook idempotency keys and background retry worker.
- Add inventory locking and transactional checkout writes.
