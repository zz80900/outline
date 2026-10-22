# Frontend Quality Guidelines

> Linting, formatting, testing, accessibility, and i18n for `app/`.

---

## Toolchain

| Task | Command |
| --- | --- |
| Lint | `yarn lint` (Oxlint) |
| Format | `yarn format` (oxfmt) |
| Type check | `yarn tsc` |
| App tests | `yarn test path/to/file.test.tsx` |

`oxfmt` uses `printWidth: 80`, `trailingComma: "es5"`. Husky runs `lint-staged` on commit.

---

## Tests

- Vitest with the `app` project (`jsdom`, URL `http://localhost`).
- Colocate tests next to the implementation; no new test directories.
- React 19: render with `createRoot` from `react-dom/client` and `act` from `react`. `ReactDOM.render` and `react-dom/test-utils` no longer exist.
- Unmount in `afterEach` inside `act`, then remove the container.
- Mock heavy children (`Scene`, `Tooltip`, `Input`, `NudeButton`) rather than React itself.

Reference: `app/scenes/Settings/MCP.test.tsx`, `app/hooks/useSettingsPath.test.tsx`, `app/utils/settings.test.ts`.

```tsx
let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  container.remove();
});
```

---

## Accessibility

- Semantic HTML first; add ARIA only when semantics are insufficient.
- Icon-only controls need `aria-label`.
- Support keyboard interaction and visible focus.
- Forms associate labels with inputs via `htmlFor`/`id`.

---

## Internationalization

- Wrap user-facing strings in `t("...")` from `react-i18next`; use `<Trans>` for embedded markup.
- Do not edit `shared/i18n/locales/*/translation.json` by hand; keys are extracted by `yarn build:i18n`.
- Keep the English source string as the key.

---

## Performance

- Lazy-load routes and heavy scenes with `lazyWithRetry`.
- Keep props stable for `observer`/memoized rows.
- Avoid subscribing list rows to whole-store computed lists.
- Use `useComputed` for narrow derivations.

---

## Review Checklist

- `yarn lint`, `yarn format`, `yarn tsc` clean for changed files.
- New behavior covered by a collocated test; React 19 APIs only.
- No `any`, no `ReactDOM.render`, no direct translation-file edits.
- Interactive elements are keyboard accessible and labeled.
- Changed shared symbols passed GitNexus impact analysis.
