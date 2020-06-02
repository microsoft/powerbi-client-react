import React, { useState } from 'react';
import { models, Report } from 'powerbi-client';
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
	const [sampleReportConfig, setReportConfig] = useState({
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
			setMessage('Report is Embedded!')
		}],
		['error', function (event) { console.error(event.detail); }]
	]);
	
	// Fetch sample report's config (eg. embedUrl and AccessToken) for embedding
	const mockSignIn = async () => {

		// Update display message
		setMessage('Fetching accessToken')

		const reportConfigResponse = await fetch(sampleReportUrl);
		
		if (!reportConfigResponse.ok) {
			console.error(`Failed to fetch config for report. Status: ${ reportConfigResponse.status } ${ reportConfigResponse.statusText }`);
			return;
		}

		const reportConfig = await reportConfigResponse.json();

		// Update display message
		setMessage('AccessToken is set successfully. Loading the PowerBI Report')

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

	const [displayMessage, setMessage] = useState(`The report is bootstraped. Click 'Embed Report' button below to provide Access Token`);
	
	return (
		<div>
			<h3>Sample Report:</h3>
			<PowerBIEmbed
				embedConfig = { sampleReportConfig }
				eventHandlers = { eventHandlersMap }
				cssClassName = { "report-style-class" }
				getEmbeddedComponent = { (embedObject:Report) => {
					report = embedObject;
					console.log(`Embedded object of type "${ report.embedtype }" received`);
				} }
			/>
			<h4>
				{ displayMessage }
			</h4>

			<button onClick = { mockSignIn }>
				Embed Report</button>

			<button onClick = { changeSettings }>
				Hide filter pane</button>
		</div>
	);
}

export default DemoApp;