# Render frontmatter as a YAML code block on import

## Goal

After importing a Markdown file with YAML frontmatter, show the frontmatter at the top of the document body as a YAML code block (Typora-style). When exporting Markdown, restore it to the `---` frontmatter form.

## Requirements

1. Import (web import, OpenAPI `documents.import`, OpenAPI `documents.create`, MCP `create_document`) inserts the raw frontmatter as a `code_block` node at the top of the body with `language: yaml` and `frontmatter: true`.
2. Existing behavior is preserved: `title` in frontmatter is still authoritative, `sourceMetadata` is still parsed and stored, and the frontmatter is not duplicated as plain paragraphs.
3. Markdown export detects a leading `frontmatter: true` code block, writes its content between `---` delimiters, and removes the code block from the body. This takes precedence over generated `source` frontmatter, avoiding duplicate blocks.
4. The frontend does not additionally render the source metadata summary when the body already shows a frontmatter code block.
5. HTML import paths are unchanged.

## Acceptance Criteria

- [x] Importing a frontmatter Markdown file yields a leading `yaml` code block marked `frontmatter: true`.
- [x] The code block content contains the original YAML keys and values.
- [x] Exporting the document emits `---` frontmatter instead of a fenced code block.
- [x] Export does not emit a second generated `source` frontmatter block.
- [x] Verified with `code-archaeology/SKILL.md`: import shows `name`/`description` and export restores `---`.
- [x] Existing converter, helper, and component tests pass; type-check and lint pass.
