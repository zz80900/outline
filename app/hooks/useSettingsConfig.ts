import {
  BrowserIcon,
  CloudIcon,
  CodeIcon,
  EmailIcon,
  ExportIcon,
  GlobeIcon,
  GroupIcon,
  ImportIcon,
  InternetIcon,
  PadlockIcon,
  PlusIcon,
  ProfileIcon,
  SettingsIcon,
  ShapesIcon,
  ShieldIcon,
  SmileyIcon,
  SparklesIcon,
  TeamIcon,
  UserIcon,
} from "outline-icons";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { TeamPreference } from "@shared/types";
import { createLazyComponent as lazy } from "~/components/LazyLoad";
import { Hook, PluginManager } from "~/utils/PluginManager";
import {
  getSettingsMode,
  integrationSettingsPathForMode,
  settingsPathForMode,
} from "~/utils/routeHelpers";
import {
  filterSettingsItems,
  SettingsConfigScope,
  SettingsGroup,
  SettingsItemId,
  SettingsMode,
} from "~/utils/settings";
import { useComputed } from "./useComputed";
import useCurrentTeam from "./useCurrentTeam";
import useCurrentUser from "./useCurrentUser";
import usePolicy from "./usePolicy";
import useStores from "./useStores";

export interface ConfigItem {
  id: string;
  name: string;
  path: string;
  icon: React.ElementType;
  component: React.ComponentType;
  description?: string;
  preload?: () => void;
  enabled: boolean;
  group: string;
  groupId: string;
  modes?: SettingsMode[];
  pluginId?: string;
}

export interface UseSettingsConfigOptions {
  mode?: SettingsMode;
  scope?: SettingsConfigScope;
}

const ApiKeys = lazy(() => import("~/scenes/Settings/ApiKeys"));
const Applications = lazy(() => import("~/scenes/Settings/Applications"));
const APIAndAccess = lazy(() => import("~/scenes/Settings/APIAndAccess"));
const Authentication = lazy(() => import("~/scenes/Settings/Authentication"));
const Details = lazy(() => import("~/scenes/Settings/Details"));
const Export = lazy(() => import("~/scenes/Settings/Export"));
const Features = lazy(() => import("~/scenes/Settings/Features"));
const Groups = lazy(() => import("~/scenes/Settings/Groups"));
const Import = lazy(() => import("~/scenes/Settings/Import"));
const Integrations = lazy(() => import("~/scenes/Settings/Integrations"));
const MCP = lazy(() => import("~/scenes/Settings/MCP"), {
  exportName: "MCP",
});
const Members = lazy(() => import("~/scenes/Settings/Members"));
const Notifications = lazy(() => import("~/scenes/Settings/Notifications"));
const Preferences = lazy(() => import("~/scenes/Settings/Preferences"));
const Profile = lazy(() => import("~/scenes/Settings/Profile"));
const Security = lazy(() => import("~/scenes/Settings/Security"));
const Shares = lazy(() => import("~/scenes/Settings/Shares"));
const Templates = lazy(() => import("~/scenes/Settings/Templates"));
const CustomEmojis = lazy(() => import("~/scenes/Settings/CustomEmojis"));
const Embeds = lazy(() => import("~/scenes/Settings/Embeds"));

/**
 * Builds the settings configuration for the active navigation mode.
 *
 * @param options settings configuration mode and consumer scope.
 * @returns enabled settings items for the requested mode and scope.
 */
export default function useSettingsConfig(
  options: UseSettingsConfigOptions = {}
) {
  const { integrations } = useStores();
  const user = useCurrentUser();
  const team = useCurrentTeam();
  const can = usePolicy(team);
  const location = useLocation();
  const { t } = useTranslation();
  const mode =
    options.mode ??
    getSettingsMode(location.pathname) ??
    SettingsMode.Simplified;
  const scope = options.scope ?? SettingsConfigScope.Navigation;

  useEffect(() => {
    void integrations.fetchAll();
  }, [integrations]);

  return useComputed(() => {
    const accountGroup = t(SettingsGroup.Account);
    const workspaceGroup = t(SettingsGroup.Workspace);
    const integrationsGroup = t(SettingsGroup.Integrations);
    const items: ConfigItem[] = [
      {
        id: SettingsItemId.Profile,
        name: t("Profile"),
        path: settingsPathForMode(mode),
        component: Profile.Component,
        preload: Profile.preload,
        enabled: true,
        group: accountGroup,
        groupId: SettingsGroup.Account,
        icon: ProfileIcon,
      },
      {
        id: SettingsItemId.Preferences,
        name: t("Preferences"),
        path: settingsPathForMode(mode, SettingsItemId.Preferences),
        component: Preferences.Component,
        preload: Preferences.preload,
        enabled: true,
        group: accountGroup,
        groupId: SettingsGroup.Account,
        icon: SettingsIcon,
      },
      {
        id: SettingsItemId.Notifications,
        name: t("Notifications"),
        path: settingsPathForMode(mode, SettingsItemId.Notifications),
        component: Notifications.Component,
        preload: Notifications.preload,
        enabled: true,
        group: accountGroup,
        groupId: SettingsGroup.Account,
        icon: EmailIcon,
      },
      {
        id: SettingsItemId.APIAndAccess,
        name: t("API & Access"),
        path: settingsPathForMode(mode, SettingsItemId.APIAndAccess),
        component: APIAndAccess.Component,
        preload: APIAndAccess.preload,
        enabled: true,
        group: accountGroup,
        groupId: SettingsGroup.Account,
        icon: PadlockIcon,
      },
      {
        id: SettingsItemId.Details,
        name: t("Details"),
        path: settingsPathForMode(mode, SettingsItemId.Details),
        component: Details.Component,
        preload: Details.preload,
        enabled: can.update,
        group: workspaceGroup,
        groupId: SettingsGroup.Workspace,
        icon: TeamIcon,
      },
      {
        id: SettingsItemId.Authentication,
        name: t("Authentication"),
        path: settingsPathForMode(mode, SettingsItemId.Authentication),
        component: Authentication.Component,
        preload: Authentication.preload,
        enabled: can.update,
        group: workspaceGroup,
        groupId: SettingsGroup.Workspace,
        icon: PadlockIcon,
      },
      {
        id: SettingsItemId.Security,
        name: t("Security"),
        path: settingsPathForMode(mode, SettingsItemId.Security),
        component: Security.Component,
        preload: Security.preload,
        enabled: can.update,
        group: workspaceGroup,
        groupId: SettingsGroup.Workspace,
        icon: ShieldIcon,
      },
      {
        id: SettingsItemId.Features,
        name: t("AI"),
        path: settingsPathForMode(mode, SettingsItemId.Features),
        component: Features.Component,
        preload: Features.preload,
        enabled: can.update,
        group: workspaceGroup,
        groupId: SettingsGroup.Workspace,
        icon: SparklesIcon,
      },
      {
        id: SettingsItemId.Members,
        name: t("Members"),
        path: settingsPathForMode(mode, SettingsItemId.Members),
        component: Members.Component,
        preload: Members.preload,
        enabled: can.listUsers,
        group: workspaceGroup,
        groupId: SettingsGroup.Workspace,
        icon: UserIcon,
      },
      {
        id: SettingsItemId.Groups,
        name: t("Groups"),
        path: settingsPathForMode(mode, SettingsItemId.Groups),
        component: Groups.Component,
        preload: Groups.preload,
        enabled: can.listGroups,
        group: workspaceGroup,
        groupId: SettingsGroup.Workspace,
        icon: GroupIcon,
      },
      {
        id: SettingsItemId.Templates,
        name: t("Templates"),
        path: settingsPathForMode(mode, SettingsItemId.Templates),
        component: Templates.Component,
        preload: Templates.preload,
        enabled: can.readTemplate,
        group: workspaceGroup,
        groupId: SettingsGroup.Workspace,
        icon: ShapesIcon,
      },
      {
        id: SettingsItemId.MCP,
        name: t("MCP"),
        path: settingsPathForMode(mode, SettingsItemId.MCP),
        component: MCP.Component,
        preload: MCP.preload,
        enabled: !!team.getPreference(TeamPreference.MCP),
        group: workspaceGroup,
        groupId: SettingsGroup.Workspace,
        modes: [SettingsMode.Simplified],
        icon: CloudIcon,
      },
      {
        id: SettingsItemId.Emojis,
        name: t("Emojis"),
        path: settingsPathForMode(mode, SettingsItemId.Emojis),
        component: CustomEmojis.Component,
        preload: CustomEmojis.preload,
        enabled: can.update,
        group: workspaceGroup,
        groupId: SettingsGroup.Workspace,
        icon: SmileyIcon,
      },
      {
        id: SettingsItemId.ApiKeys,
        name: t("API Keys"),
        path: settingsPathForMode(mode, SettingsItemId.ApiKeys),
        component: ApiKeys.Component,
        preload: ApiKeys.preload,
        enabled: can.listApiKeys,
        group: workspaceGroup,
        groupId: SettingsGroup.Workspace,
        icon: CodeIcon,
      },
      {
        id: SettingsItemId.Applications,
        name: t("Applications"),
        path: settingsPathForMode(mode, SettingsItemId.Applications),
        component: Applications.Component,
        preload: Applications.preload,
        enabled: can.listOAuthClients,
        group: workspaceGroup,
        groupId: SettingsGroup.Workspace,
        icon: InternetIcon,
      },
      {
        id: SettingsItemId.Shares,
        name: t("Shared Links"),
        path: settingsPathForMode(mode, SettingsItemId.Shares),
        component: Shares.Component,
        preload: Shares.preload,
        enabled: can.listShares,
        group: workspaceGroup,
        groupId: SettingsGroup.Workspace,
        icon: GlobeIcon,
      },
      {
        id: SettingsItemId.Import,
        name: t("Import"),
        path: settingsPathForMode(mode, SettingsItemId.Import),
        component: Import.Component,
        preload: Import.preload,
        enabled: can.createImport,
        group: workspaceGroup,
        groupId: SettingsGroup.Workspace,
        icon: ImportIcon,
      },
      {
        id: SettingsItemId.Export,
        name: t("Export"),
        path: settingsPathForMode(mode, SettingsItemId.Export),
        component: Export.Component,
        preload: Export.preload,
        enabled: can.createExport,
        group: workspaceGroup,
        groupId: SettingsGroup.Workspace,
        icon: ExportIcon,
      },
      {
        id: SettingsItemId.Embeds,
        name: t("Embeds"),
        path: integrationSettingsPathForMode(mode, SettingsItemId.Embeds),
        component: Embeds.Component,
        preload: Embeds.preload,
        description: t(
          "Configure which embed providers are available in the editor."
        ),
        enabled: can.update,
        group: integrationsGroup,
        groupId: SettingsGroup.Integrations,
        icon: BrowserIcon,
      },
      {
        id: SettingsItemId.Integrations,
        name: `${t("Install")}…`,
        path: settingsPathForMode(mode, SettingsItemId.Integrations),
        component: Integrations.Component,
        preload: Integrations.preload,
        enabled: can.update,
        group: integrationsGroup,
        groupId: SettingsGroup.Integrations,
        icon: PlusIcon,
      },
    ];

    PluginManager.getHooks(Hook.Settings).forEach((plugin) => {
      const groupId = plugin.value.group ?? SettingsGroup.Integrations;
      const after = plugin.value.after;
      const insertIndex = after
        ? items.findIndex((item) => item.name === t(after)) + 1
        : items.findIndex((item) => item.groupId === groupId);
      items.splice(insertIndex, 0, {
        id: plugin.id,
        name: t(plugin.name),
        path:
          groupId === SettingsGroup.Integrations
            ? integrationSettingsPathForMode(mode, plugin.id)
            : settingsPathForMode(mode, plugin.id),
        group: t(groupId),
        groupId,
        pluginId: plugin.id,
        description: plugin.value.description,
        component: plugin.value.component.Component,
        preload: plugin.value.component.preload,
        enabled: plugin.value.enabled
          ? plugin.value.enabled(team, user)
          : can.update,
        icon: plugin.value.icon,
      });
    });

    return filterSettingsItems(items, mode, scope);
  }, [
    t,
    mode,
    scope,
    team,
    user,
    can.update,
    can.listUsers,
    can.listGroups,
    can.readTemplate,
    can.listApiKeys,
    can.listOAuthClients,
    can.listShares,
    can.createImport,
    can.createExport,
  ]);
}
