import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Time from "~/components/Time";
import type Document from "~/models/Document";

type Props = {
  /** The document to display source metadata for. */
  document: Document;
};

/**
 * Displays read-only metadata describing where an imported document came from.
 *
 * @param props the document to read source metadata from.
 * @returns the metadata block, or null when no source metadata is available.
 */
function DocumentSourceMetadata({ document }: Props) {
  const { t } = useTranslation();
  const { sourceMetadata } = document;

  if (!sourceMetadata) {
    return null;
  }

  const {
    fileName,
    importType,
    importedAt,
    createdByName,
    originalDocumentId,
  } = sourceMetadata;

  if (
    !fileName &&
    !importType &&
    !importedAt &&
    !createdByName &&
    !originalDocumentId
  ) {
    return null;
  }

  return (
    <Panel aria-label={t("Source metadata")}>
      <Heading>{t("Source")}</Heading>
      <Rows>
        {fileName && (
          <>
            <Label>{t("File")}</Label>
            <Value>{fileName}</Value>
          </>
        )}
        {importType && (
          <>
            <Label>{t("Import type")}</Label>
            <Value>{importType}</Value>
          </>
        )}
        {importedAt && (
          <>
            <Label>{t("Imported")}</Label>
            <Value>
              <Time dateTime={importedAt} addSuffix />
            </Value>
          </>
        )}
        {createdByName && (
          <>
            <Label>{t("Original creator")}</Label>
            <Value>{createdByName}</Value>
          </>
        )}
        {originalDocumentId && (
          <>
            <Label>{t("Original document")}</Label>
            <Value>{originalDocumentId}</Value>
          </>
        )}
      </Rows>
    </Panel>
  );
}

const Panel = styled.aside`
  margin-bottom: 24px;
  padding: 16px 20px;
  border: 1px solid ${(props) => props.theme.divider};
  border-radius: 8px;
  background: ${(props) => props.theme.backgroundSecondary};
`;

const Heading = styled.h2`
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
  color: ${(props) => props.theme.textTertiary};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const Rows = styled.dl`
  display: grid;
  grid-template-columns: minmax(120px, auto) 1fr;
  gap: 6px 16px;
  margin: 0;
  font-size: 14px;
`;

const Label = styled.dt`
  color: ${(props) => props.theme.textTertiary};
`;

const Value = styled.dd`
  margin: 0;
  color: ${(props) => props.theme.text};
  overflow-wrap: anywhere;
`;

export default observer(DocumentSourceMetadata);
