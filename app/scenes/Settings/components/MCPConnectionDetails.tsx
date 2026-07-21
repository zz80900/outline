import { CopyIcon } from "outline-icons";
import * as React from "react";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "sonner";
import styled, { useTheme } from "styled-components";
import CopyToClipboard from "~/components/CopyToClipboard";
import Input from "~/components/Input";
import NudeButton from "~/components/NudeButton";
import Text from "~/components/Text";
import Tooltip from "~/components/Tooltip";

/**
 * Displays the connection instructions and endpoint for the workspace MCP server.
 *
 * @returns the MCP server connection details.
 */
export const MCPConnectionDetails = React.memo(function MCPConnectionDetails() {
  const { t } = useTranslation();
  const theme = useTheme();
  const mcpEndpoint = `${window.location.origin}/mcp`;

  const handleCopied = React.useCallback(() => {
    toast.success(t("Copied to clipboard"));
  }, [t]);

  return (
    <Container>
      <Instructions type="secondary" as="p">
        <Trans
          defaults="Use the following endpoint to connect to the MCP server from your app. Find out more about setup in <a>the docs</a>."
          components={{
            a: (
              <Text
                as="a"
                weight="bold"
                href="https://docs.getoutline.com/s/guide/doc/mcp-6j9jtENNKL"
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
          }}
        />
      </Instructions>
      <Input
        id="mcpEndpoint"
        aria-label={t("MCP endpoint")}
        readOnly
        value={mcpEndpoint}
        margin={0}
        spellCheck={false}
      >
        <Tooltip content={t("Copy URL")} placement="top">
          <CopyToClipboard text={mcpEndpoint} onCopy={handleCopied}>
            <NudeButton
              type="button"
              aria-label={t("Copy URL")}
              style={{ marginRight: 3 }}
            >
              <CopyIcon color={theme.placeholder} size={18} />
            </NudeButton>
          </CopyToClipboard>
        </Tooltip>
      </Input>
    </Container>
  );
});

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Instructions = styled(Text)`
  margin: 0;
  line-height: 1.5;
`;
