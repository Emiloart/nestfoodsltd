# Chat Agent v1

## Purpose

Provide a grounded, conversion-focused assistant for Nest Foods that supports:

- product discovery
- allergen guidance
- recipe suggestions
- order status guidance
- traceability lookup
- B2B quote onboarding

## UX Surface

- Floating widget mounted globally from `apps/web/components/providers.tsx`.
- Component: `apps/web/components/chat/chat-agent-widget.tsx`.
- Quick-prompt chips and suggested links for fast intent routing.
- Human handoff form when confidence is low or support is required.

## Backend

- Domain types: `apps/web/lib/chat/types.ts`
- Seed data: `apps/web/lib/chat/seed.ts`
- Storage adapter: `apps/web/lib/chat/store.ts`
  - supports `CHAT_STORAGE_DRIVER=json|postgres`
- Chat service: `apps/web/lib/chat/service.ts`
  - rule-based intent resolution
  - grounded data fetches from commerce/recipes/traceability modules
  - conversation and lead persistence

## API

- `POST /api/chat/ask`

  - payload: message + optional conversation/session IDs
  - rate-limited and audit-logged
  - returns answer, intent, confidence, quick actions, suggested links

- `POST /api/chat/leads`
  - payload: support lead details + optional conversation/session IDs
  - rate-limited and audit-logged
  - creates handoff lead for human follow-up

## Security and Reliability

- Trusted-origin enforcement for write operations.
- Rate limits on both ask and lead endpoints.
- Audit events for success/failure/blocked requests.
- Storage-driver compatibility with existing Postgres JSONB module strategy.

## Next Iteration

- Add admin chat inbox for lead triage and SLA tracking.
- Add analytics dashboard for top intents and unresolved questions.
- Add retrieval ranker and confidence calibration with production chat logs.
