# Add text style controls

> Migrated from OpenSpec change `add-text-style-controls` (created 2026-07-22).

## Why

Outline currently supports semantic Markdown formatting but cannot preserve or edit inline text color and font size. Teams importing styled HTML or Markdown containing controlled `<span>` elements lose these presentation attributes, and authors have no selection-toolbar controls to apply them consistently.

## What Changes

- Add inline text color formatting and numeric pixel font-size input to the document editor through the existing text-selection toolbar.
- Add safe parsing for controlled `<span>` attributes and styles in HTML and Markdown input without enabling unrestricted raw HTML.
- Serialize supported text styles back to canonical `<span>` markup so styled content round-trips through Markdown, ProseMirror, collaboration state, HTML export, and PDF rendering.
- Restrict colors and numeric font sizes to validated values and ranges, provide explicit reset actions, and prevent these styles from applying to code content or unsupported selections.
- **BREAKING**: Extend the ProseMirror schema with new mark types and increment the editor major version so older clients cannot edit documents containing unsupported marks.

## Capabilities

### New Capabilities

- `inline-text-styling`: Defines safe inline color and font-size marks, controlled `<span>` parsing and serialization, selection-toolbar behavior, persistence, export, and compatibility requirements.

### Modified Capabilities

None.

## Impact

- Shared editor schema, mark commands, Markdown rules, HTML parsing, and serialization.
- Selection toolbar menus and reusable color-picker UI.
- Collaboration editor-version compatibility and server-side document conversion.
- Document, revision, share, presentation, HTML, Markdown, and PDF rendering paths.
- No database migration or new runtime dependency is expected.
