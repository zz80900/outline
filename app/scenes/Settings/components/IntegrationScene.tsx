import { SettingsIcon } from "outline-icons";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { createInternalLinkAction } from "~/actions";
import { NavigationSection } from "~/actions/sections";
import Breadcrumb from "~/components/Breadcrumb";
import Scene from "~/components/Scene";
import useSettingsPath from "~/hooks/useSettingsPath";

export function IntegrationScene({
  children,
  ...rest
}: React.ComponentProps<typeof Scene>) {
  const { t } = useTranslation();
  const settingsPath = useSettingsPath();

  const breadcrumbActions = React.useMemo(
    () => [
      createInternalLinkAction({
        name: t("Integrations"),
        section: NavigationSection,
        icon: <SettingsIcon />,
        to: settingsPath("integrations"),
      }),
    ],
    [t, settingsPath]
  );

  return (
    <Scene left={<Breadcrumb actions={breadcrumbActions} />} {...rest}>
      {children}
    </Scene>
  );
}
