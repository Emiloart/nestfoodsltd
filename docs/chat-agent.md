# Chat Agent Scope

The chat assistant is a lightweight corporate website helper.

## Supported Intents

- greeting
- product information
- allergen information
- company information
- careers guidance
- contact and enquiry handoff

## Allowed Answers

- De-Nest Bread product names, descriptions, ingredients, allergens, nutrition notes, and size formats
- Nest Foods Limited company information
- mission, vision, values, and production standards
- HR contact and application guidance
- official phones, emails, WhatsApp numbers, and contact page handoff

## Implementation

- Types live in `apps/web/lib/chat/types.ts`.
- Service logic lives in `apps/web/lib/chat/service.ts`.
- Widget UI lives in `apps/web/components/chat/chat-agent-widget.tsx`.
- Runtime data lives in `apps/web/data/chat.json` for the JSON driver.

The assistant should stay concise and hand off to `/contact` when confidence is low.
