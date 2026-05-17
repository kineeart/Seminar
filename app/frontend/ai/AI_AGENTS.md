# AI_AGENTS.md

## Nguyen t?c chia agent
- M?i agent ownership file ro rang.
- Khong ??ng ch?ng cheo cung file trong cung th?i ?i?m.

## Agent A - UI Foundation
- Ownership:
  - `src/components/ui/*`
  - `src/styles/*`
- Nhi?m v?:
  - T?o UI primitives + design tokens.

## Agent B - Layout + Routing
- Ownership:
  - `src/App.jsx`
  - `src/components/layout/*`
  - `src/pages/*` (khung)
- Nhi?m v?:
  - D?ng layout va route mapping.

## Agent C - Feature pages
- Ownership:
  - `src/components/chat/*`
  - `src/components/flashcard/*`
  - `src/components/quiz/*`
- Nhi?m v?:
  - Migrate UI theo page feature.

## Agent D - Integration
- Ownership:
  - `src/hooks/*`
  - `src/services/*`
- Nhi?m v?:
  - Wiring state + API + fallback UI.

## Handoff rule
- M?i agent ph?i ghi:
  - file ?a s?a
  - ch?a lam gi
  - risk con l?i
