/** Available settings navigation modes. */
export enum SettingsMode {
  Simplified = "simplified",
  Complete = "complete",
}

/** Stable settings sidebar group identifiers. */
export enum SettingsGroup {
  Account = "Account",
  Workspace = "Workspace",
  Integrations = "Integrations",
}

/** Stable identifiers for built-in settings items. */
export enum SettingsItemId {
  Profile = "profile",
  Preferences = "preferences",
  Notifications = "notifications",
  APIAndAccess = "api-and-access",
  Details = "details",
  Authentication = "authentication",
  Security = "security",
  Features = "features",
  Members = "members",
  Groups = "groups",
  Templates = "templates",
  MCP = "mcp",
  Emojis = "emojis",
  ApiKeys = "api-keys",
  Applications = "applications",
  Shares = "shares",
  Import = "import",
  Export = "export",
  Embeds = "embeds",
  Integrations = "integrations",
}

/** Settings configuration consumers. */
export enum SettingsConfigScope {
  Navigation = "navigation",
  Routes = "routes",
}

/** Minimum fields required to filter a settings item. */
export interface FilterableSettingsItem {
  id: string;
  enabled: boolean;
  groupId: string;
  modes?: SettingsMode[];
}

const simplifiedItemIds = new Set<string>([
  SettingsItemId.Groups,
  SettingsItemId.Templates,
  SettingsItemId.MCP,
  SettingsItemId.Shares,
  SettingsItemId.Import,
  SettingsItemId.Export,
]);

/**
 * Filters settings items for a navigation mode and consumer scope.
 *
 * @param items settings items to filter.
 * @param mode active settings navigation mode.
 * @param scope consumer scope for the filtered items.
 * @returns settings items available to the requested mode and scope.
 */
export function filterSettingsItems<T extends FilterableSettingsItem>(
  items: T[],
  mode: SettingsMode,
  scope: SettingsConfigScope
): T[] {
  return items.filter((item) => {
    if (!item.enabled || (item.modes && !item.modes.includes(mode))) {
      return false;
    }

    if (scope === SettingsConfigScope.Routes) {
      return true;
    }

    if (mode === SettingsMode.Complete) {
      return true;
    }

    return (
      item.groupId === SettingsGroup.Account || simplifiedItemIds.has(item.id)
    );
  });
}
