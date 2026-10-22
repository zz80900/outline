# Implementation Plan: Markdown export title and metadata

## 1. Markdown export

- [x] 1.1 Add `includeSourceMetadata?: boolean` to `DocumentHelper.toMarkdown` options and document it with JSDoc.
- [x] 1.2 Build the whitelisted `source` object from `Document.sourceMetadata`, dropping empty values and `trial`.
- [x] 1.3 Serialize the frontmatter with `js-yaml` (`noRefs: true`, `lineWidth: -1`), prefix `---` blocks with LF newlines, and return no frontmatter when metadata is empty.
- [x] 1.4 Update `ExportDocumentTreeTask` to pass `includeTitle: false` and `includeSourceMetadata: true` for `FileOperationFormat.MarkdownZip` only.
- [x] 1.5 Verify TextBundle and HTML export paths keep their current output.

## 2. Frontend metadata block

- [x] 2.1 Extend the frontend `Document` model `sourceMetadata` type with `originalDocumentId`.
- [x] 2.2 Add `app/scenes/Document/components/DocumentSourceMetadata.tsx`: read-only card, `observer`, renders only when displayable metadata exists.
- [x] 2.3 Render source file, import type, imported date, original creator, and original document ID when present; use `t()` labels and theme tokens.
- [x] 2.4 Insert the component in `app/scenes/Document/components/Document.tsx` after `<Notices />` in the non-revision branch; keep it out of the public share view.

## 4. Import source metadata

- [x] 4.1 Add `server/utils/frontmatter.ts` with `parseFrontmatter`, `stripFrontmatter`, and `parseSourceMetadata`; delegate `BaseConverter` helpers to it.
- [x] 4.2 Add `sourceMetadata` to `DocumentConverter.ConvertResult` and forward it from `documentImporter`.
- [x] 4.3 Merge frontmatter metadata with caller metadata in `DocumentImportTask` (web import and OpenAPI `documents.import`).
- [x] 4.4 Parse and strip frontmatter in OpenAPI `documents.create` and pass `sourceMetadata` to `documentCreator`.
- [x] 4.5 Parse and strip frontmatter in MCP `create_document` (Markdown branch) and pass `sourceMetadata`.
- [x] 4.6 Add tests for the utility, converter extraction, web import, OpenAPI create, and MCP create. Utility and converter tests pass; DB-backed path tests are written but require PostgreSQL.

## 5. Tests and verification

- [x] 3.1 Add `DocumentHelper.toMarkdown` tests for title omission, frontmatter present/absent, and unchanged body.
- [x] 3.2 Update `ExportMarkdownZipTask.test.ts` for the new `.md` output and add a TextBundle regression assertion.
- [x] 3.3 Add a round-trip test importing exported Markdown through `DocumentConverter` and asserting the frontmatter is stripped.
- [x] 3.4 Add `DocumentSourceMetadata` component tests for both render and no-render cases.
- [x] 3.5 Run `yarn tsc`, lint, and the component test. Server tests are pending: PostgreSQL is not running in this environment.
- [x] 3.6 GitNexus impact/detect_changes unavailable (the `outline` repo is not indexed in the running MCP server); caller impact was reviewed with text search instead.
