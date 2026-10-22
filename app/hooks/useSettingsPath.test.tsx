import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import useSettingsPath from "./useSettingsPath";

function PathProbe() {
  const settingsPath = useSettingsPath();
  return <span data-path={settingsPath("groups", "group-id", "members")} />;
}

describe("useSettingsPath", () => {
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

  it("preserves the complete settings namespace", () => {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={["/settings2/templates"]}>
          <PathProbe />
        </MemoryRouter>
      );
    });

    expect(container.querySelector("span")?.getAttribute("data-path")).toBe(
      "/settings2/groups/group-id/members"
    );
  });

  it("uses the simplified namespace outside complete settings", () => {
    act(() => {
      root.render(
        <MemoryRouter initialEntries={["/home"]}>
          <PathProbe />
        </MemoryRouter>
      );
    });

    expect(container.querySelector("span")?.getAttribute("data-path")).toBe(
      "/settings/groups/group-id/members"
    );
  });
});
