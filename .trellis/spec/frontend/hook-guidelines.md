# Hook Guidelines

> Custom hook naming, composition, and subscription rules.

---

## Overview

Hooks live in `app/hooks/` when reused across components. One hook per file, named `useSomething.ts`, with a JSDoc block describing the return value.

---

## Naming and Exports

- File name equals the primary hook name: `useSettingsPath.ts` exports `useSettingsPath`.
- Auxiliary hooks may be exported from the same file when tightly coupled (`useSettingsMode`).
- Use named or default export consistently with the surrounding directory; new hooks default to named exports.

```ts
/**
 * Returns a path builder that preserves the active settings namespace.
 *
 * @returns a callback that builds settings paths for the current mode.
 */
export default function useSettingsPath() {
  const mode = useSettingsMode();

  return useCallback(
    (...args: string[]) => settingsPathForMode(mode, ...args),
    [mode]
  );
}
```

Reference: `app/hooks/useSettingsPath.ts`.

---

## Data and State Hooks

| Hook | Use for |
| --- | --- |
| `useStores()` | Access MobX stores from a component |
| `useCurrentTeam()` / `useCurrentUser()` | Current session entities |
| `usePolicy(model)` | Authorization abilities |
| `useComputed(fn)` | Derive a narrow observable value; re-renders only when the result changes |
| `useLocationSelector(fn)` | Select a slice of the route instead of subscribing to all location changes |
| `useRequest(fn, deps)` | Async request with loading/error state |

---

## Rules

- Return stable callbacks with `useCallback` and stable objects with `useMemo` when consumers are `observer`/memoized.
- Dependencies must be complete; do not suppress the exhaustive-deps warning.
- Do not call hooks conditionally or in loops.
- Hooks must not import route components; they may import models, stores, and utilities.
- When a hook needs the current path in a long-lived component, prefer `useLocationSelector` over `useLocation`.
- Side effects belong in `useEffect`; cleanup timers and subscriptions.

---

## Testing Hooks

- Test through a probe component rendered with `createRoot` and `act` from `react` (React 19).
- Mock heavy children rather than mocking React itself.
- Reference: `app/hooks/useSettingsPath.test.tsx`.
