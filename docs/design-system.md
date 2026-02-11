# Design System Baseline

## Principles

- Minimal and premium visual language with generous whitespace.
- Motion is subtle and informative, never distracting.
- Component styles are reusable and consistent in light/dark mode.

## Tokens

- Defined in `apps/web/app/globals.css`:
  - Surface, foreground, muted, and border variables.
  - Brand accents for gradients and highlights.
  - Radius scale and soft elevation shadow.

## Primitives

- `Button` in `apps/web/components/ui/button.tsx`
- `Input` in `apps/web/components/ui/input.tsx`
- `Card` in `apps/web/components/ui/card.tsx`
- `Badge` in `apps/web/components/ui/badge.tsx`
- `Skeleton` in `apps/web/components/ui/skeleton.tsx`
- `Modal` in `apps/web/components/ui/modal.tsx`

## Motion & Theme

- `FadeIn` animation component in `apps/web/components/motion/fade-in.tsx`.
- Theme switching through `next-themes` in `apps/web/components/providers.tsx`.
- Header includes responsive desktop/mobile navigation and theme toggle.
