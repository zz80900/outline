# Design

- `CodeFence` schema gains a boolean `frontmatter` attribute (default `false`) used only as an internal marker.
- `server/utils/frontmatter.ts` adds `getFrontmatterSource()` returning the raw YAML between the delimiters for valid frontmatter.
- `DocumentConverter.convert` keeps parsing `sourceMetadata` and title, then prepends a `code_block` node (`language: yaml`, `frontmatter: true`) containing the raw YAML to the parsed body.
- `DocumentHelper.toMarkdown` detects a leading marked code block, removes it, emits `---\n<content>\n---\n\n`, and skips generated source frontmatter when present.
- `DocumentSourceMetadata` returns null when the first body node is a marked frontmatter code block to avoid duplicate metadata UI.
