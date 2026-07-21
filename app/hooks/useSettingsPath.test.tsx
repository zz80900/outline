import * as React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import useSettingsPath from "./useSettingsPath";

function PathProbe() {
  const settingsPath = useSettingsPath();
  return <span data-path={settingsPath("groups", "group-id", "members")} />;
}

describe("useSettingsPath", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  it("preserves the complete settings namespace", () => {
    act(() => {
      ReactDOM.render(
        <MemoryRouter initialEntries={["/settings2/templates"]}>
          <PathProbe />
        </MemoryRouter>,
        container
      );
    });

    expect(container.querySelector("span")?.getAttribute("data-path")).toBe(
      "/settings2/groups/group-id/members"
    );
  });

  it("uses the simplified namespace outside complete settings", () => {
    act(() => {
      ReactDOM.render(
        <MemoryRouter initialEntries={["/home"]}>
          <PathProbe />
        </MemoryRouter>,
        container
      );
    });

    expect(container.querySelector("span")?.getAttribute("data-path")).toBe(
      "/settings/groups/group-id/members"
    );
  });
});
