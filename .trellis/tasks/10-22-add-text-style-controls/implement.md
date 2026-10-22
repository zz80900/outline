## 1. Core text-style model

- [ ] 1.1 Add shared text color normalization plus numeric font-size bounds and strict attribute validators, with focused unit tests for valid integers, boundary values, invalid units, decimals, and out-of-range values.
- [ ] 1.2 Add explicit value-oriented `setMark` and `unsetMark` commands plus a selection-state helper that reports uniform, mixed, and unset Mark values without using toggle semantics.
- [ ] 1.3 Implement the `text_color` Mark with validated ProseMirror attributes, controlled DOM parsing, safe canonical DOM output, and Markdown token mappings.
- [ ] 1.4 Implement the `font_size` Mark with an integer `8–96` attribute, fixed `px` DOM rendering, controlled DOM parsing, safe canonical DOM output, and Markdown token mappings.
- [ ] 1.5 Register both Marks only in the rich editor extension set and update code node/Mark exclusions so text styles cannot coexist with code content.

## 2. Controlled span Markdown support

- [ ] 2.1 Implement a shared `markdown-it` inline rule that recognizes only paired `<span>` tags containing supported text color or font size attributes while global raw HTML remains disabled.
- [ ] 2.2 Emit independent open and close tokens for color and font size, including valid combined or nested spans, and preserve visible text when markup is invalid or unsupported.
- [ ] 2.3 Register the controlled span rule in the shared Markdown parser and emit canonical `data-*` plus safe `style` attributes from the Markdown serializer.
- [ ] 2.4 Add parser and serializer tests covering canonical spans, numeric pixel sizes, boundary values, unsupported units and ranges, style-only compatibility input, combined Marks, nesting, malformed tags, unsupported CSS, event attributes, alpha colors, and Markdown round trips.

## 3. Selection toolbar controls

- [ ] 3.1 Extract reusable Mark color-picker behavior from the existing highlight color UI without changing highlight behavior, including preset, recent, custom, and reset interactions.
- [ ] 3.2 Add a text color menu that applies preset or opaque custom colors, resets only `text_color`, and displays uniform or mixed selection state.
- [ ] 3.3 Add an integer font size input with a `px` suffix, `8–96` bounds, step `1`, Enter/blur commit behavior, inherited-default reset, and uniform or mixed selection state.
- [ ] 3.4 Integrate both menus into the existing formatting toolbar with correct ordering, read-only and unsupported-selection handling, code-context exclusion, keyboard labels, tooltips, and responsive mobile behavior.
- [ ] 3.5 Add focused component or editor tests for numeric input boundaries, apply, replace, clear/reset, invalid input, mixed selections, inherited defaults, preservation of other Marks, disabled contexts, keyboard operation, and mobile availability.

## 4. Persistence, rendering, and compatibility

- [ ] 4.1 Add editor integration tests proving text style Marks survive ProseMirror JSON serialization, Y.js collaboration updates, document reload, and concurrent apply/remove operations.
- [ ] 4.2 Verify and test document, share, revision, presentation, HTML export, Markdown export, and PDF rendering paths retain the supported styles through the shared rich schema.
- [ ] 4.3 Increment the editor version from `17.0.0` to `18.0.0` and update compatibility tests to confirm older major-version clients are rejected while pre-existing documents open without migration.
- [ ] 4.4 Finalize an accessible foreground-color preset palette using existing theme tokens, validate preset contrast in light and dark themes, and keep custom colors explicitly opaque.

## 5. Quality verification

- [ ] 5.1 Run the targeted shared editor and application test files added or changed by this work and resolve all failures.
- [ ] 5.2 Run formatting, linting, and TypeScript checks for the affected workspace and resolve all introduced diagnostics.
- [ ] 5.3 Run GitNexus change detection against `main` and confirm the affected symbols and execution flows match the editor schema, Markdown conversion, toolbar, rendering, and compatibility scope described by this change.
