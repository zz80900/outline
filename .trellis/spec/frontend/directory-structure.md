# Frontend Directory Structure

> How the React application in `app/` is organized.

---

## Overview

The frontend is a React 19 + React Router + MobX + styled-components application built by Vite. State logic and styles are co-located with components unless they are global.

---

## Directory Layout

```text
app/
├── actions/       Reusable command actions (navigate, create, open, share)
├── components/    Components reused across scenes
├── editor/        Editor-specific React components
├── hooks/         Reusable React hooks (`useX.ts`)
├── menus/         Context menus used in multiple places
├── models/        MobX observables representing server entities
├── routes/        Route definitions, lazy-loaded with Suspense
├── scenes/        Full-page views composed from components
├── stores/        Collections of models plus fetch logic
├── types/         Frontend-only TypeScript types
└── utils/         Frontend-only utilities
```

Shared code that both client and server need lives in `shared/` (`shared/utils`, `shared/types`, `shared/editor`, `shared/styles`).

---

## Where New Code Goes

| Need | Location |
| --- | --- |
| A full page | `app/scenes/<Name>.tsx` |
| Reusable UI | `app/components/<Name>.tsx` |
| A hook used by 2+ components | `app/hooks/use<Name>.ts` |
| A command-bar / menu action | `app/actions/definitions/<area>.tsx` |
| Entity state and API calls | `app/models/<Entity>.ts` (single) or `app/stores/<Entities>Store.ts` (collection) |
| Route registration | `app/routes/authenticated.tsx` or `app/routes/index.tsx` |
| Route path builders | `app/utils/routeHelpers.ts` |
| Theme tokens and breakpoints | `shared/styles/` |
| Markdown/editor logic shared with server | `shared/editor/` |

---

## Naming Conventions

- Component and scene files: `PascalCase.tsx`.
- Styled-only modules that export a styled component: `PascalCase.ts`.
- Hooks: `useSomething.ts`, named export or default export.
- Stores: `<Entity>sStore.ts`; models: singular `PascalCase.ts`.
- Tests: collocated `<name>.test.ts(x)`.
- Event handlers: prefix with `handle` (`handleClick`, `handleSubmit`).

---

## Route Loading

- Route chunks are lazy-loaded with `lazyWithRetry` and rendered inside `Suspense`.
- Use the project `Route` component (`app/components/ProfiledRoute`) rather than React Router's `Route` directly so navigation timing is tracked.

Reference: `app/routes/index.tsx`, `app/routes/authenticated.tsx`.

---

## Examples

- Page composed of panels: `app/scenes/Settings/AI.tsx`
- Reusable styled component: `app/components/Button.tsx`
- Hook pair: `app/hooks/useSettingsPath.ts`
- MobX store: `app/stores/DocumentsStore.ts`
- MobX model: `app/models/Document.ts`
- Action definition: `app/actions/definitions/navigation.tsx`
