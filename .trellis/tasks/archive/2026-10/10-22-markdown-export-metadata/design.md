# Design: Markdown export title and metadata

## Current Flow

1. `FileOperation.createExport` records an export request.
2. `FileOperationCreatedProcessor` schedules `ExportMarkdownZipTask`.
3. `ExportDocumentTreeTask.processDocument` loads each document and calls
   `DocumentHelper.toMarkdown(document, { commonMark: true })`.
4. `DocumentHelper.toMarkdown` prepends `# <title>` because `includeTitle` defaults to `true`, then serializes the Prosemirror body.

The importer side already understands frontmatter: `BaseConverter.parseFrontmatter` / `stripFrontmatter` parse YAML at the start of a file and remove it from the body.

## Export Changes

### `DocumentHelper.toMarkdown`

Add an option:

```ts
options?: {
  includeTitle?: boolean;
  /** Whether to prepend source metadata as YAML frontmatter (default: false). */
  includeSourceMetadata?: boolean;
  ...
}
```

When `includeSourceMetadata` is true and the input is a `Document` with a non-empty `sourceMetadata`:

- Build a whitelisted object from `sourceMetadata`: `fileName`, `mimeType`, `createdByName`, `externalId`, `externalName`, `originalDocumentId`, `originalCollectionId`, `authType`. Drop `null` / `undefined` values. Do not export `trial`.
- Serialize with `js-yaml` `dump`, `{ noRefs: true, lineWidth: -1 }`.
- Prefix the result:

```text
---
source:
  fileName: report.docx
  createdByName: Alice
---

<body>
```

- Use `\n` newlines regardless of platform.
- When no source metadata exists, emit no frontmatter and no leading delimiter.
- `Revision` and `Collection` inputs keep current behavior (no frontmatter).

### `ExportDocumentTreeTask`

Change the Markdown branch to:

```ts
await DocumentHelper.toMarkdown(document, {
  commonMark: true,
  includeTitle: false,
  includeSourceMetadata: true,
});
```

The branch is shared by `MarkdownZip` and `TextBundleZip` (`TextBundleHelper.textFileName` writes `text.md`). To keep scope limited to MarkdownZip, gate the new options on `format === FileOperationFormat.MarkdownZip`. HTML export keeps `toHTML` unchanged.

File naming in the archive is unaffected; it already uses the document title.

## Import Changes

### Shared frontmatter utility

Add `server/utils/frontmatter.ts`:

- `parseFrontmatter(content)` — YAML at the start of the document, same regex rules as `BaseConverter`.
- `stripFrontmatter(content)` — remove a valid frontmatter block from the body.
- `parseSourceMetadata(frontmatter)` — read the `source` object, keep whitelisted keys with string values, return `undefined` when absent or empty.

`BaseConverter` delegates its existing protected helpers to this utility so parsing rules stay in one place.

### Creation paths

- `DocumentConverter.ConvertResult` gains `sourceMetadata?: SourceMetadata`, parsed from the frontmatter it already reads for the title.
- `documentImporter` forwards `sourceMetadata` from the conversion result.
- `DocumentImportTask` merges `{ ...callerSourceMetadata, ...convertedSourceMetadata }`, so frontmatter values win and caller file name/mime type fill gaps. Covers web import and OpenAPI `documents.import`.
- OpenAPI `documents.create` and MCP `create_document` (Markdown branch) call `parseFrontmatter` / `stripFrontmatter` / `parseSourceMetadata` on the `text` input, create the document from the stripped body, and pass the parsed metadata to `documentCreator`.
- HTML paths are unchanged.

## Frontend Rendering

New component `app/scenes/Document/components/DocumentSourceMetadata.tsx`:

- `observer` component taking `document: Document`.
- Renders nothing when `document.sourceMetadata` has no displayable field.
- Renders a read-only card above the editor body with rows for:
  - Source file (`fileName`)
  - Import type (`importType`)
  - Imported at (`importedAt`, formatted with the existing date helpers used by `DocumentMeta`)
  - Original creator (`createdByName`)
  - Original document ID (`originalDocumentId`)
- Labels use `t("...")`; values are plain text.
- Styled with theme tokens (`theme.divider`, `theme.backgroundSecondary`, `Text type="secondary"`), matching the MCP settings panel style in `app/scenes/Settings/components/MCPConnectionDetails.tsx`.

Placement in `app/scenes/Document/components/Document.tsx`: inside the non-revision branch, immediately after `<Notices />` and before `Contents`/`Editor`, so it appears at the top of the editor content. Not shown on the public share page (`SharedHeader` branch) to avoid exposing internal source information.

Extend the frontend `Document` model `sourceMetadata` type with `originalDocumentId?: string` (already returned by the presenter).

## Compatibility

- Default `includeSourceMetadata: false` keeps every other `toMarkdown` caller unchanged (API `text`, MCP, email, importers).
- The exported frontmatter is valid YAML and is stripped by the existing importer, so round-trip import keeps working.
- No migration and no new dependency (`js-yaml` already present).

## Tests

- `server/models/helpers/DocumentHelper.test.ts`: frontmatter emitted for a document with source metadata; absent without metadata; no title H1 when `includeTitle: false`; body unchanged.
- `server/queues/tasks/ExportMarkdownZipTask.test.ts`: exported `.md` files have no `# title` and include frontmatter when metadata exists; TextBundle output unchanged.
- `app/scenes/Document/components/DocumentSourceMetadata.test.tsx`: renders fields when metadata exists, renders nothing otherwise.
- Round-trip: import an exported string through `DocumentConverter` and assert the body does not contain `source:`.

## Risks

- Consumers that parse exported Markdown may not expect frontmatter. This is intentional and only applies to MarkdownZip.
- Source metadata can contain user-provided strings; YAML dump handles quoting, and the importer validates with `js-yaml`.
