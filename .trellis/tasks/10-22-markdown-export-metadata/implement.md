# Implementation Plan: Markdown export title and metadata

## 1. Markdown export

- [ ] 1.1 Add `includeSourceMetadata?: boolean` to `DocumentHelper.toMarkdown` options and document it with JSDoc.
- [ ] 1.2 Build the whitelisted `source` object from `Document.sourceMetadata`, dropping empty values and `trial`.
- [ ] 1.3 Serialize the frontmatter with `js-yaml` (`noRefs: true`, `lineWidth: -1`), prefix `---` blocks with LF newlines, and return no frontmatter when metadata is empty.
- [ ] 1.4 Update `ExportDocumentTreeTask` to pass `includeTitle: false` and `includeSourceMetadata: true` for `FileOperationFormat.MarkdownZip` only.
- [ ] 1.5 Verify TextBundle and HTML export paths keep their current output.

## 2. Frontend metadata block

- [ ] 2.1 Extend the frontend `Document` model `sourceMetadata` type with `originalDocumentId`.
- [ ] 2.2 Add `app/scenes/Document/components/DocumentSourceMetadata.tsx`: read-only card, `observer`, renders only when displayable metadata exists.
- [ ] 2.3 Render source file, import type, imported date, original creator, and original document ID when present; use `t()` labels and theme tokens.
- [ ] 2.4 Insert the component in `app/scenes/Document/components/Document.tsx` after `<Notices />` in the non-revision branch; keep it out of the public share view.

## 3. Tests and verification

- [ ] 3.1 Add `DocumentHelper.toMarkdown` tests for title omission, frontmatter present/absent, and unchanged body.
- [ ] 3.2 Update `ExportMarkdownZipTask.test.ts` for the new `.md` output and add a TextBundle regression assertion.
- [ ] 3.3 Add a round-trip test importing exported Markdown through `DocumentConverter` and asserting the frontmatter is stripped.
- [ ] 3.4 Add `DocumentSourceMetadata` component tests for both render and no-render cases.
- [ ] 3.5 Run targeted Vitest files, `yarn lint`, and `yarn tsc`.
- [ ] 3.6 Run GitNexus impact analysis before editing `DocumentHelper.toMarkdown`, `ExportDocumentTreeTask`, and `Document.tsx`; run `detect_changes` before committing.
