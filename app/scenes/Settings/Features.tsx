import { observer } from "mobx-react";
import { SparklesIcon } from "outline-icons";
import * as React from "react";
import { useTranslation, Trans } from "react-i18next";
import { toast } from "sonner";
import { TeamPreference } from "@shared/types";
import { TeamValidation } from "@shared/validations";
import Heading from "~/components/Heading";
import Scene from "~/components/Scene";
import Switch from "~/components/Switch";
import Text from "~/components/Text";
import useCurrentTeam from "~/hooks/useCurrentTeam";
import { MCPConnectionDetails } from "./components/MCPConnectionDetails";
import SettingRow from "./components/SettingRow";
import Input from "~/components/Input";

function Features() {
  const { t } = useTranslation();
  const team = useCurrentTeam();

  const handleMCPChange = React.useCallback(
    async (checked: boolean) => {
      team.setPreference(TeamPreference.MCP, checked);
      await team.save();
      toast.success(t("Settings saved"));
    },
    [team, t]
  );

  const handleGuidanceMCPChange = React.useCallback(
    async (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
      team.guidanceMCP = ev.target.value || null;
    },
    [team]
  );

  const handleGuidanceMCPBlur = React.useCallback(async () => {
    await team.save();
    toast.success(t("Settings saved"));
  }, [team, t]);

  return (
    <Scene title={t("AI")} icon={<SparklesIcon />}>
      <Heading>{t("AI")}</Heading>
      <Text as="p" type="secondary">
        <Trans>Manage AI and integration features for your workspace.</Trans>
      </Text>

      <SettingRow
        name={TeamPreference.MCP}
        label={t("MCP server")}
        description={t(
          "Allow members to connect to this workspace with MCP to read and write data."
        )}
      >
        <Switch
          id={TeamPreference.MCP}
          name={TeamPreference.MCP}
          checked={team.getPreference(TeamPreference.MCP)}
          onChange={handleMCPChange}
        />
      </SettingRow>

      {team.getPreference(TeamPreference.MCP) && (
        <SettingRow name="mcpEndpoint" label={t("MCP endpoint")}>
          <MCPConnectionDetails />
        </SettingRow>
      )}

      {team.getPreference(TeamPreference.MCP) && (
        <SettingRow
          name="guidanceMCP"
          label={t("Additional guidance")}
          description={t(
            "You can use these optional instructions to tell MCP clients how to use your knowledge base."
          )}
        >
          <Input
            id="guidanceMCP"
            type="textarea"
            autoSize
            minHeight="6lh"
            maxHeight="20lh"
            value={team.guidanceMCP ?? ""}
            maxLength={TeamValidation.maxGuidanceMCPLength}
            warningLimit={TeamValidation.warnGuidanceMCPLength}
            onChange={handleGuidanceMCPChange}
            onBlur={handleGuidanceMCPBlur}
          />
        </SettingRow>
      )}

      <SettingRow
        name="answers"
        label={t("AI answers")}
        description={t(
          "Use AI to get direct answers to questions in search. This feature requires a paid license."
        )}
        border={false}
      >
        <Switch disabled />
      </SettingRow>
    </Scene>
  );
}

export default observer(Features);
