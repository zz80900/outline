import { TrashIcon } from "outline-icons";
import stores from "~/stores";
import { createAction } from "..";
import { SettingsSection } from "../sections";
import type Integration from "~/models/Integration";
import { DisconnectAnalyticsDialog } from "~/scenes/Settings/components/DisconnectAnalyticsDialog";
import type { IntegrationType } from "@shared/types";
import history from "~/utils/history";
import { settingsPathFromLocation } from "~/utils/routeHelpers";

export const disconnectIntegrationFactory = (integration?: Integration) =>
  createAction({
    name: ({ t }) => t("Disconnect"),
    analyticsName: "Disconnect integration",
    section: SettingsSection,
    icon: <TrashIcon />,
    keywords: "disconnect",
    visible: () => !!integration,
    perform: async ({ event, location }) => {
      event?.preventDefault();
      event?.stopPropagation();

      await integration?.delete();
      history.push(settingsPathFromLocation(location.pathname, "integrations"));
    },
  });

export const disconnectAnalyticsIntegrationFactory = (
  integration?: Integration<IntegrationType.Analytics>
) =>
  createAction({
    name: ({ t }) => t("Disconnect analytics"),
    analyticsName: "Disconnect analytics",
    section: SettingsSection,
    icon: <TrashIcon />,
    keywords: "disconnect",
    visible: () => !!integration,
    perform: ({ t, event }) => {
      event?.preventDefault();
      event?.stopPropagation();

      stores.dialogs.openModal({
        title: t("Disconnect analytics"),
        content: <DisconnectAnalyticsDialog integration={integration!} />,
      });
    },
  });
