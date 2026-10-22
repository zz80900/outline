import yaml from "js-yaml";
import type { SourceMetadata } from "@shared/types";

/** Source metadata fields accepted from Markdown frontmatter. */
const sourceMetadataKeys = [
  "fileName",
  "mimeType",
  "createdByName",
  "externalId",
  "externalName",
  "originalDocumentId",
  "originalCollectionId",
  "authType",
] as const satisfies readonly (keyof SourceMetadata)[];

// Frontmatter must start at the beginning of the document.
const frontmatterRegex = /^---\n([\s\S]*?)\n---(?:\n|$)/;

/**
 * Parses YAML frontmatter at the start of the content, if present.
 *
 * @param content The markdown content that may contain frontmatter.
 * @returns The parsed frontmatter as an object, or undefined when no valid
 *   frontmatter is present.
 */
export function parseFrontmatter(
  content: string
): Record<string, unknown> | undefined {
  const match = content.match(frontmatterRegex);
  if (!match) {
    return undefined;
  }

  try {
    const data: unknown = yaml.load(match[1]);
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return data as Record<string, unknown>;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Removes YAML frontmatter from the start of the content, if present.
 * Content that is not valid YAML is not frontmatter and is left in place.
 *
 * @param content The markdown content, possibly with frontmatter.
 * @returns The markdown content without frontmatter.
 */
export function stripFrontmatter(content: string): string {
  const match = content.match(frontmatterRegex);
  if (!match) {
    return content;
  }

  try {
    yaml.load(match[1]);
  } catch {
    return content;
  }

  return content.slice(match[0].length);
}

/**
 * Extracts supported source metadata from parsed frontmatter.
 *
 * @param frontmatter The parsed frontmatter object.
 * @returns The whitelisted source metadata with non-empty string values, or
 *   undefined when the frontmatter has no supported source fields.
 */
export function parseSourceMetadata(
  frontmatter: Record<string, unknown> | undefined
): SourceMetadata | undefined {
  const source = frontmatter?.source;
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return undefined;
  }

  const metadata: Record<string, string> = {};
  for (const key of sourceMetadataKeys) {
    const value = (source as Record<string, unknown>)[key];
    if (typeof value === "string" && value !== "") {
      metadata[key] = value;
    }
  }

  return Object.keys(metadata).length > 0
    ? (metadata as unknown as SourceMetadata)
    : undefined;
}
