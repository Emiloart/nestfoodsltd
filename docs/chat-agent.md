# Chat Agent v1

## Purpose

Provide a grounded assistant for Nest Foods that supports:

- company information
- product information
- allergen guidance
- quality standards overview
- contact and enquiry guidance
- distributor interest capture
- careers guidance

## Out of Scope

- order status or payment tracking
- traceability lookup or batch verification
- quote, invoice, statement, or portal workflows
- cart, checkout, account, or wishlist support
- recipe guidance as a primary public feature

## UX Surface

- Floating widget mounted globally from `apps/web/components/providers.tsx`
- Component: `apps/web/components/chat/chat-agent-widget.tsx`
- Quick prompts and suggested links focused on products, quality standards, contact, distributor enquiry, and careers
- Human handoff form when confidence is low or direct follow-up is needed

## Backend

- Domain types: `apps/web/lib/chat/types.ts`
- Seed data: `apps/web/lib/chat/seed.ts`
- Storage adapter: `apps/web/lib/chat/store.ts`
  - supports `CHAT_STORAGE_DRIVER=json|postgres`
- Chat service: `apps/web/lib/chat/service.ts`
  - rule-based intent resolution
  - grounded fetches from product data and site navigation scope
  - handoff capture for direct follow-up

## API

- `POST /api/chat/ask`
  - payload: message + optional conversation/session IDs
  - returns answer, intent, confidence, quick actions, suggested links
- `POST /api/chat/leads`
  - payload: support lead details + optional conversation/session IDs
  - creates handoff lead for human follow-up

## Guardrails

- If a visitor asks about orders, traceability, or portal workflows, the assistant should explain that those are not part of the public corporate site and point the visitor to the appropriate contact route.
- The assistant should not imply online purchase, batch lookup, quote tooling, or account workflows.
- Public suggestions should stay within products, quality standards, contact, distributor enquiry, careers, and general company information.
