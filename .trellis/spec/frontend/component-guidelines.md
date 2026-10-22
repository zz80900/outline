# Component Guidelines

> React component patterns, props, styles, and rendering rules.

---

## Overview

Use function components with hooks. Components that read MobX observables must be wrapped in `observer` from `mobx-react`. Styling uses styled-components and shared theme helpers.

---

## Component Shape

```tsx
type Props = {
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Called when the user activates the button. */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export function Example({ disabled, onClick }: Props) {
  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
        onClick?.(event);
      }
    },
    [disabled, onClick]
  );

  return <button disabled={disabled} onClick={handleClick} />;
}
```

- Use `interface` or a `Props` type with JSDoc on non-obvious members.
- Do not import React unless used directly; `jsx: "react-jsx"` is configured.
- Event handlers are prefixed with `handle`.

## MobX Components

- Wrap components that read observables with `observer(...)`.
- Keep props stable for memoized/`observer` components, especially list rows. Do not create arrays, objects, or JSX on every render; share constants for empty arrays.
- Do not read `ref.current` during render to pass it to props or context. Keep the element in state with a callback ref.
- If a `useState` initial value reads observables, use a lazy initializer.
- In components that stay mounted across navigation (layout, sidebar, command bar), do not use `useLocation`. Use `useLocationSelector` to select only the value needed, or read `history.location` inside effects and handlers.

Reference: `app/components/AuthenticatedLayout.tsx`, `app/components/Sidebar/Settings.tsx`.

## Styling

- Use styled-components. Define styled primitives in the same file, below the component.
- Use theme helpers from `@shared/styles` (`s("accent")`, `theme.divider`) instead of hard-coded colors.
- Import breakpoints as `import { breakpoint } from "@shared/styles/breakpoint";`.
- Use transient props (`$fullwidth`) for style-only props so they are not forwarded to the DOM.
- Mobile touch targets use `MOBILE_TOUCH_TARGET` from `@shared/constants`.

Reference: `app/components/Button.tsx`, `app/scenes/Settings/MCP.tsx`.

## Accessibility

- Prefer semantic elements (`button`, `nav`, `main`, `h2`) over divs with handlers.
- Provide `aria-label` when visible text is absent (icon buttons).
- Ensure keyboard operation and visible focus states.
- Do not disable outline without an alternative focus indicator.

## Rendering and Performance

- Lazy-load heavy scenes with `lazyWithRetry`.
- Use `React.memo` only when a component is measurably expensive and props are stable.
- Use `useComputed` to derive a narrow observable value instead of reading a large computed list during render.

## Forbidden

- Class components.
- Inline styles for anything theme-dependent that has a token.
- Passing new object/array literals to `observer` children.
- Reading observables during render for a per-item check when a `useComputed` selector would do.
