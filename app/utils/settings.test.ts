import {
  filterSettingsItems,
  SettingsConfigScope,
  SettingsGroup,
  SettingsItemId,
  SettingsMode,
} from "./settings";

interface TestItem {
  id: string;
  enabled: boolean;
  groupId: string;
  modes?: SettingsMode[];
}

const items: TestItem[] = [
  {
    id: SettingsItemId.Profile,
    enabled: true,
    groupId: SettingsGroup.Account,
  },
  {
    id: "account-plugin",
    enabled: true,
    groupId: SettingsGroup.Account,
  },
  {
    id: SettingsItemId.Groups,
    enabled: true,
    groupId: SettingsGroup.Workspace,
  },
  {
    id: SettingsItemId.Shares,
    enabled: true,
    groupId: SettingsGroup.Workspace,
  },
  {
    id: SettingsItemId.Details,
    enabled: true,
    groupId: SettingsGroup.Workspace,
  },
  {
    id: SettingsItemId.MCP,
    enabled: true,
    groupId: SettingsGroup.Workspace,
    modes: [SettingsMode.Simplified],
  },
  {
    id: SettingsItemId.Import,
    enabled: false,
    groupId: SettingsGroup.Workspace,
  },
];

describe("filterSettingsItems", () => {
  it("returns the simplified navigation allowlist and account plugins", () => {
    expect(
      filterSettingsItems(
        items,
        SettingsMode.Simplified,
        SettingsConfigScope.Navigation
      ).map((item) => item.id)
    ).toEqual([
      SettingsItemId.Profile,
      "account-plugin",
      SettingsItemId.Groups,
      SettingsItemId.Shares,
      SettingsItemId.MCP,
    ]);
  });

  it("returns all enabled complete navigation items available to the mode", () => {
    expect(
      filterSettingsItems(
        items,
        SettingsMode.Complete,
        SettingsConfigScope.Navigation
      ).map((item) => item.id)
    ).toEqual([
      SettingsItemId.Profile,
      "account-plugin",
      SettingsItemId.Groups,
      SettingsItemId.Shares,
      SettingsItemId.Details,
    ]);
  });

  it("keeps hidden navigation items available to simplified routes", () => {
    expect(
      filterSettingsItems(
        items,
        SettingsMode.Simplified,
        SettingsConfigScope.Routes
      ).map((item) => item.id)
    ).toEqual([
      SettingsItemId.Profile,
      "account-plugin",
      SettingsItemId.Groups,
      SettingsItemId.Shares,
      SettingsItemId.Details,
      SettingsItemId.MCP,
    ]);
  });

  it("removes disabled items for every mode and scope", () => {
    expect(
      filterSettingsItems(
        items,
        SettingsMode.Complete,
        SettingsConfigScope.Routes
      ).some((item) => item.id === SettingsItemId.Import)
    ).toBe(false);
  });

  it("removes the MCP item when the workspace preference is disabled", () => {
    const disabledMcpItems = items.map((item) =>
      item.id === SettingsItemId.MCP ? { ...item, enabled: false } : item
    );

    expect(
      filterSettingsItems(
        disabledMcpItems,
        SettingsMode.Simplified,
        SettingsConfigScope.Routes
      ).some((item) => item.id === SettingsItemId.MCP)
    ).toBe(false);
  });
});
