import { Switch, useLocation } from "react-router-dom";
import { observer } from "mobx-react";
import Error404 from "~/scenes/Errors/Error404";
import { createLazyComponent as lazy } from "~/components/LazyLoad";
import Route from "~/components/ProfiledRoute";
import useSettingsConfig from "~/hooks/useSettingsConfig";
import { getSettingsMode, settingsPathForMode } from "~/utils/routeHelpers";
import { SettingsConfigScope } from "~/utils/settings";

const Application = lazy(() => import("~/scenes/Settings/Application"));
const GroupMembers = lazy(() => import("~/scenes/Settings/GroupMembers"), {
  exportName: "GroupMembersScene",
});
const Template = lazy(() => import("~/scenes/Settings/Template"));
const TemplateNew = lazy(() => import("~/scenes/Settings/TemplateNew"));

function SettingsRoutes() {
  const location = useLocation();
  const mode = getSettingsMode(location.pathname);
  const configs = useSettingsConfig({
    mode,
    scope: SettingsConfigScope.Routes,
  });

  if (!mode) {
    return <Route component={Error404} />;
  }

  return (
    <Switch>
      {configs.map((config) => (
        <Route
          exact
          key={config.path}
          path={config.path}
          component={config.component}
        />
      ))}
      {/* TODO: Refactor these exceptions into config? */}
      <Route
        exact
        path={settingsPathForMode(mode, "groups", ":id", "members")}
        component={GroupMembers.Component}
      />
      <Route
        exact
        path={settingsPathForMode(mode, "applications", ":id")}
        component={Application.Component}
      />
      <Route
        exact
        path={settingsPathForMode(mode, "templates", "new")}
        component={TemplateNew.Component}
      />
      <Route
        exact
        path={settingsPathForMode(mode, "templates", ":id")}
        component={Template.Component}
      />
      <Route component={Error404} />
    </Switch>
  );
}

export default observer(SettingsRoutes);
