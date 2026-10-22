import {
  parseFrontmatter,
  parseSourceMetadata,
  stripFrontmatter,
} from "./frontmatter";

describe("frontmatter", () => {
  it("should parse a valid frontmatter block", () => {
    expect(parseFrontmatter("---\ntitle: Test\n---\n\nBody")).toEqual({
      title: "Test",
    });
  });

  it("should ignore content without a leading frontmatter block", () => {
    expect(parseFrontmatter("Body\n\n---\ntitle: Test\n---")).toBeUndefined();
  });

  it("should ignore invalid YAML", () => {
    expect(
      parseFrontmatter("---\ntitle: [unclosed\n---\n\nBody")
    ).toBeUndefined();
  });

  it("should strip a valid frontmatter block", () => {
    expect(stripFrontmatter("---\ntitle: Test\n---\n\nBody")).toBe("\nBody");
  });

  it("should leave invalid frontmatter in place", () => {
    const content = "---\ntitle: [unclosed\n---\n\nBody";
    expect(stripFrontmatter(content)).toBe(content);
  });

  it("should extract whitelisted source metadata", () => {
    expect(
      parseSourceMetadata({
        source: {
          fileName: "report.docx",
          createdByName: "Alice",
          trial: true,
          ignored: "value",
          externalId: 42,
        },
      })
    ).toEqual({ fileName: "report.docx", createdByName: "Alice" });
  });

  it("should return undefined without a source object", () => {
    expect(parseSourceMetadata({ title: "Test" })).toBeUndefined();
    expect(parseSourceMetadata({ source: { trial: true } })).toBeUndefined();
    expect(parseSourceMetadata(undefined)).toBeUndefined();
  });
});
