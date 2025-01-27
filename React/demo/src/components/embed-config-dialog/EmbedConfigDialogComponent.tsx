// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from "react";
import { provideFluentDesignSystem, fluentDialog, fluentButton, fluentTextField } from '@fluentui/web-components';
import { provideReactWrapper } from '@microsoft/fast-react-wrapper';
import './EmbedConfigDialogComponent.css';

const { wrap } = provideReactWrapper(React, provideFluentDesignSystem());

export const FluentDialog = wrap(fluentDialog());
export const FluentButton = wrap(fluentButton());
export const FluentTextField = wrap(fluentTextField());

interface EmbedReportDialogProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onEmbed: (embedUrl: string, accessToken: string) => void;
}

const EmbedConfigDialog = ({
  isOpen,
  onRequestClose,
  onEmbed,
}: EmbedReportDialogProps) => {
  const [aadToken, setAadToken] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [areFieldsFilled, setAreFieldsFilled] = useState<boolean>(false);

  useEffect(() => {
    setAreFieldsFilled(!!aadToken && !!embedUrl);
  }, [aadToken, embedUrl]);

  const onAadTokenChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setAadToken(event.target.value);
  }

  const onEmbedUrlChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEmbedUrl(event.target.value);
  }

  const runConfig = (): void => {
    if (aadToken && embedUrl) {
      onEmbed(embedUrl, aadToken);
    }
  };

  const hideEmbedConfigDialog = (): void => {
    setAadToken("");
    setEmbedUrl("");
    onRequestClose();
  };

  return (
    isOpen ? (
      <FluentDialog>
        <div className="dialog-header">
          <h2 className="dialog-title">Use your own Microsoft Entra token</h2>
          <button className="close-icon-button" onClick={hideEmbedConfigDialog}>&#x2715;</button>
        </div>
        <div className="dialog-main">
          <p>Follow the <a href="https://learn.microsoft.com/rest/api/power-bi/embed-token/generate-token" target="_blank" rel="noopener noreferrer">Microsoft Entra Token</a> documentation to generate a Microsoft Entra Token.</p>
          <span>Insert your Microsoft Entra token</span>
          <FluentTextField name="aadToken" value={aadToken} onInput={onAadTokenChange} className="dialog-field" aria-label="AAD Token" />

          <p>Use the <a href="https://learn.microsoft.com/rest/api/power-bi/reports/get-report-in-group" target="_blank" rel="noopener noreferrer">Get Report In Group</a> REST API to get your embed URL.</p>
          <span>Insert your embed URL</span>
          <FluentTextField name="embedUrl" value={embedUrl} onInput={onEmbedUrlChange} className="dialog-field" aria-label="Embed URL" />
        </div>
        <div className="dialog-buttons">
          <FluentButton className={`run-button ${areFieldsFilled ? "active" : ""}`} disabled={!areFieldsFilled} onClick={runConfig}>Run</FluentButton>
          <FluentButton className="close-button" onClick={hideEmbedConfigDialog}>Close</FluentButton>
        </div>
      </FluentDialog>
    ) : null
  );
};

export default EmbedConfigDialog;