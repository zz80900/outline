# State Management

> MobX stores, models, and subscription boundaries.

---

## Overview

Global state uses MobX. Server entities are represented by observable models in `app/models/`; collections of entities plus fetch logic live in stores in `app/stores/`. Business logic belongs in stores/models, not components.

---

## Stores and Models

- `RootStore` composes feature stores; components reach them through `useStores()`.
- Models hold observable fields and entity behavior (`save`, `delete`, `move`, computed getters).
- Stores hold maps/lists of models and fetch/pagination logic.
- Decorate with `@observable`, `@computed`, `@action`, or use `makeObservable`. Class fields without initializers trigger the `mobx/observable-needs-initializer` lint rule.
- Use `computedFn` for parameterized derived lookups; pass `{ requiresReaction: false }` only when it is also called outside reactions.

Reference: `app/stores/DocumentsStore.ts`, `app/models/Document.ts`.

---

## Subscription Boundaries

These rules prevent accidental full-store re-renders:

- Use `observable.map` instead of a `Set` when observers check membership by key. `ObservableSet.has()` tracks the whole set.
- Store lookups called for each row of a list must not scan a computed list such as `orderedData`; that subscribes the component to every item.
- Do not read an observable during render only for an effect or per-item check. Use `useComputed` to derive a narrow value (for example `isActive`).
- A context value provided near the app root must not change on navigation. Expose frequently changing store values as getters read on access.
- Components that stay mounted across navigation use `useLocationSelector`, not `useLocation`.

Reference: `app/components/Sidebar/Settings.tsx`, `app/hooks/useSettingsConfig.ts`.

---

## Data Fetching

- Network calls go through `client` from `~/utils/ApiClient` and live in stores/models.
- Stores expose `fetch`, `fetchPage`, `add`, and `remove` style methods; components call them from effects or event handlers.
- Keep loading/error state on the store, not in ad-hoc component state, when multiple components need it.
- Pagination follows the `PaginationParams` conventions in `app/types`.

---

## Local State

- Use `useState` for UI-only state scoped to one component (open/closed, draft input).
- Use `useReducer` for multi-field local transitions.
- Do not mirror server state into local state; read the model.

---

## Forbidden

- Business logic in components that mutates models directly.
- Creating a second store instance for the same entity type.
- Subscribing a list row to the whole store to compute a per-row boolean.
- Storing derived values instead of computing them with `@computed`/`useComputed`.
