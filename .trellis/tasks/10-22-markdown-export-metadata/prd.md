# Markdown export title and metadata

## Goal

Export Markdown without duplicating the document title as an H1, include the document's source metadata as YAML frontmatter, and render that metadata as a read-only block at the top of the document editor.

## Background

- Markdown export is produced by `ExportDocumentTreeTask.processDocument`, which calls `DocumentHelper.toMarkdown(document, { commonMark: true })`. `includeTitle` defaults to `true`, so every exported file starts with `# <title>`.
- No frontmatter is written by any Markdown export path today.
- `Document.sourceMetadata` stores the original source of imported documents (`fileName`, `mimeType`, `createdByName`, `externalId`, `externalName`, `originalDocumentId`, `originalCollectionId`, `authType`, `trial`); the presenter already exposes `importedAt`, `importType`, `createdByName`, `fileName`, and `originalDocumentId` to the client.
- Import already parses YAML frontmatter (`BaseConverter.parseFrontmatter` / `stripFrontmatter`) and removes it from the body.

## Decisions

1. **Metadata fields**: export `sourceMetadata` only, nested under a `source` key in the frontmatter. Documents without source metadata do not get a frontmatter block.
2. **Frontend rendering**: a read-only metadata block at the top of the document editor, visible only when the document has source metadata.
3. **Enablement**: on by default for Markdown export; no user-facing toggle in this iteration.
4. **Scope**: `MarkdownZip` exports only (single document and collection trees). TextBundle and HTML exports are unchanged.

## Requirements

### 1. Do not export the title as an H1

- Markdown files produced by `MarkdownZip` export must not begin with `# <document title>`.
- Applies to single-document and collection/document-tree exports.
- File names in the archive continue to be derived from the document title.

### 2. Export source metadata as YAML frontmatter

- When `Document.sourceMetadata` is present, prepend a YAML block:

  ```yaml
  ---
  source:
    fileName: report.docx
    importType: docx
    importedAt: 2026-07-01T10:00:00.000Z
    createdByName: Alice
    originalDocumentId: 0f7c...
  ---
  ```

- Include only fields with defined values; omit empty fields and the whole block when there is no source metadata.
- The block must be valid YAML, use LF newlines, and round-trip through the existing importer (which strips it from the body).
- The document body follows immediately after the closing delimiter.

### 3. Render metadata in the frontend

- Add a read-only `DocumentSourceMetadata` block above the editor content when `document.sourceMetadata` has visible fields.
- Show: source file name, import type, imported date, original creator, original document ID (only when present).
- Use `t("...")` for labels; no manual translation file edits.
- The block is visible to users who can read the document and is not editable.

## Acceptance Criteria

- [ ] Single-document MarkdownZip export produces a `.md` file with no `# <title>` heading.
- [ ] Collection MarkdownZip export produces `.md` files with no title heading.
- [ ] Documents with source metadata export a valid `---` frontmatter block containing `source` fields.
- [ ] Documents without source metadata export no frontmatter block.
- [ ] Re-importing an exported file strips the frontmatter from the body.
- [ ] TextBundle and HTML export output is unchanged.
- [ ] The editor shows a read-only source metadata block when metadata exists and hides it otherwise.
- [ ] Tests cover export with/without metadata, title omission, round-trip import, and the frontend block.
- [ ] `yarn lint`, `yarn tsc`, and targeted Vitest files pass.

## Out of Scope

- Exporting title, author, collection, URL, or publication fields in frontmatter.
- User-facing toggles for frontmatter export.
- TextBundle, HTML, MCP, and email Markdown generation paths.
