import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ThemeProvider } from "styled-components";
import { light } from "@shared/styles/theme";
import type Document from "~/models/Document";
import DocumentSourceMetadata from "./DocumentSourceMetadata";

vi.mock("~/components/Time", () => ({
  default: ({ dateTime }: { dateTime: string }) => <time>{dateTime}</time>,
}));

describe("DocumentSourceMetadata", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  const render = (document: Document) => {
    act(() => {
      root.render(
        <ThemeProvider theme={light}>
          <DocumentSourceMetadata document={document} />
        </ThemeProvider>
      );
    });
  };

  it("should render source metadata when present", () => {
    render({
      sourceMetadata: {
        fileName: "report.docx",
        importType: "docx",
        importedAt: "2026-07-01T10:00:00.000Z",
        createdByName: "Alice",
        originalDocumentId: "doc-123",
      },
    } as unknown as Document);

    expect(container.textContent).toContain("report.docx");
    expect(container.textContent).toContain("docx");
    expect(container.textContent).toContain("Alice");
    expect(container.textContent).toContain("doc-123");
  });

  it("should render nothing without source metadata", () => {
    render({ sourceMetadata: undefined } as unknown as Document);

    expect(container.textContent).toBe("");
  });

  it("should render nothing when source metadata has no displayable fields", () => {
    render({ sourceMetadata: {} } as unknown as Document);

    expect(container.textContent).toBe("");
  });
});
