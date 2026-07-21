import * as React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { ThemeProvider } from "styled-components";
import copy from "copy-to-clipboard";
import { light } from "@shared/styles/theme";
import { MCP } from "./MCP";

vi.mock("copy-to-clipboard", () => ({
  default: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

vi.mock("~/components/Scene", () => ({
  default: ({ children }: { children?: React.ReactNode }) => (
    <main>{children}</main>
  ),
}));

vi.mock("~/components/Tooltip", () => ({
  default: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock("~/components/Input", () => ({
  default: ({
    children,
    readOnly,
    value,
  }: {
    children?: React.ReactNode;
    readOnly?: boolean;
    value?: string;
  }) => (
    <div>
      <input readOnly={readOnly} value={value} />
      {children}
    </div>
  ),
}));

vi.mock("~/components/NudeButton", () => ({
  default: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} />
  ),
}));

describe("MCP", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    vi.mocked(copy).mockClear();
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  it("shows connection information without administration controls", () => {
    act(() => {
      ReactDOM.render(
        <ThemeProvider theme={light}>
          <MCP />
        </ThemeProvider>,
        container
      );
    });

    const endpoint =
      container.querySelector<HTMLInputElement>("input[readonly]");
    expect(endpoint?.value).toBe("http://localhost/mcp");
    expect(container.querySelector('input[type="checkbox"]')).toBeNull();
    expect(container.querySelector("textarea")).toBeNull();
  });

  it("copies the MCP endpoint", () => {
    act(() => {
      ReactDOM.render(
        <ThemeProvider theme={light}>
          <MCP />
        </ThemeProvider>,
        container
      );
    });

    const copyButton = container.querySelector("button");
    expect(copyButton).not.toBeNull();
    expect(copyButton?.getAttribute("aria-label")).toBe("Copy URL");

    act(() => {
      copyButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(copy).toHaveBeenCalledWith(
      "http://localhost/mcp",
      expect.objectContaining({ format: "text/plain" })
    );
  });
});
