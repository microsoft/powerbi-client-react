// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { models, Report, Embed, IEmbedConfiguration, service } from 'powerbi-client';
import { PowerBIEmbed } from 'powerbi-client-react';
import './DemoApp.css';

// Root Component to demonstrate usage of wrapper component
function DemoApp () {

	// PowerBI Report object (to be received via callback)
	let report: Report;

	// API end-point url to get embed config for a sample report
	const sampleReportUrl = 'https://aka.ms/sampleReportEmbedConfig';

	// Report config useState hook
	// Values for properties like embedUrl, accessToken and settings will be set on click of buttons below
	const [sampleReportConfig, setReportConfig] = useState<IEmbedConfiguration>({
		type: 'report',
		embedUrl: undefined,
		tokenType: models.TokenType.Embed,
		accessToken: undefined,
		settings: undefined,
	});

	// Map of event handlers to be applied to the embedding report
	const eventHandlersMap = new Map([
		['loaded', function () {console.log('Report has loaded');}],
		['rendered', function () {
			console.log('Report has rendered');
			
			// Update display message
			setMessage('The report is rendered')
		}],
		['error', function (event: service.ICustomEvent<any>) { 
			console.error(event.detail); 
		}]
	]);
	
	// Fetch sample report's config (eg. embedUrl and AccessToken) for embedding
	const mockSignIn = async () => {

		// Fetch sample report's embed config
		const reportConfigResponse = await fetch(sampleReportUrl);
		
		if (!reportConfigResponse.ok) {
			console.error(`Failed to fetch config for report. Status: ${ reportConfigResponse.status } ${ reportConfigResponse.statusText }`);
			return;
		}

		const reportConfig = await reportConfigResponse.json();

		// Update display message
		setMessage('The access token is successfully set. Loading the Power BI report')

		// Update the state "sampleReportConfig" and re-render DemoApp component
		setReportConfig({
			...sampleReportConfig,
			embedUrl: reportConfig.embedUrl,
			accessToken: reportConfig.embedToken.token
		});
	}

	const changeSettings = () => {

		// Update the state "sampleReportConfig" and re-render DemoApp component
		setReportConfig({
			...sampleReportConfig,
			settings: {
				panes: {
					filters: {
						expanded: false,
						visible: false
					}
				}
			}
		});
	}

	const [displayMessage, setMessage] = useState(`The report is bootstrapped. Click the Embed Report button to set the access token`);

	const controlButtons = 
		<div className = "controls">
			<button onClick = { mockSignIn }>
				Embed Report</button>

			<button onClick = { changeSettings }>
				Hide filter pane</button>
		</div>;

	const header = 
		<div className = "header">
			<div className = "title">React wrapper demo app</div>
		</div>;

	const footer = 
		<div className = "footer">
			<div className = "footer-text">
				GitHub: &nbsp;
				<a href="https://github.com/microsoft/PowerBI-client-react">https://github.com/microsoft/PowerBI-client-react</a>
			</div>
		</div>;
	
	return (
		<div>
			{ header }
			
			<PowerBIEmbed
				embedConfig = { sampleReportConfig }
				eventHandlers = { eventHandlersMap }
				cssClassName = { "report-style-class" }
				getEmbeddedComponent = { (embedObject:Embed) => {
					report = embedObject as Report;
					console.log(`Embedded object of type "${ report.embedtype }" received`);
				} }
			/>

			<div className = "hr"></div>

			<div className = "displayMessage">
				{ displayMessage }
			</div>

			{ controlButtons }

			{ footer }
		</div>
	);
}

export default DemoApp;