import { observer } from "mobx-react";
import { CloudIcon } from "outline-icons";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import breakpoint from "styled-components-breakpoint";
import Heading from "~/components/Heading";
import Scene from "~/components/Scene";
import Text from "~/components/Text";
import { MCPConnectionDetails } from "./components/MCPConnectionDetails";

/**
 * Displays MCP connection information for authenticated workspace users.
 *
 * @returns the MCP connection settings scene.
 */
export const MCP = observer(function MCP() {
  const { t } = useTranslation();

  return (
    <Scene title={t("MCP")} icon={<CloudIcon />}>
      <Content>
        <Heading>{t("MCP")}</Heading>
        <Introduction as="p" type="secondary">
          {t("Connect your apps to this workspace through the MCP server.")}
        </Introduction>

        <ConnectionPanel aria-labelledby="mcp-server-heading">
          <ConnectionHeader>
            <SectionHeading
              as="h2"
              id="mcp-server-heading"
              size="medium"
              weight="xbold"
            >
              {t("MCP server")}
            </SectionHeading>
            <SectionDescription as="p" type="secondary">
              {t(
                "Allow members to connect to this workspace with MCP to read and write data."
              )}
            </SectionDescription>
          </ConnectionHeader>
          <MCPConnectionDetails />
        </ConnectionPanel>
      </Content>
    </Scene>
  );
});

const Content = styled.div`
  width: 100%;
  max-width: 640px;
`;

const Introduction = styled(Text)`
  max-width: 60ch;
  margin-bottom: 40px;
  line-height: 1.5;
`;

const ConnectionPanel = styled.section`
  padding: 24px;
  border: 1px solid ${(props) => props.theme.divider};
  border-radius: 8px;
  background: ${(props) => props.theme.backgroundSecondary};

  ${breakpoint("tablet")`
    padding: 20px 16px;
  `};
`;

const ConnectionHeader = styled.div`
  margin-bottom: 20px;
`;

const SectionHeading = styled(Text)`
  display: block;
  margin-bottom: 4px;
  line-height: 1.4;
`;

const SectionDescription = styled(Text)`
  display: block;
  max-width: 60ch;
  margin-bottom: 0;
  line-height: 1.5;
`;
