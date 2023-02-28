// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { models, Report, Embed, service, Page } from 'powerbi-client';
import { IHttpPostMessageResponse } from 'http-post-message';
import { PowerBIEmbed } from 'powerbi-client-react';
import 'powerbi-report-authoring';

import { sampleReportUrl } from './public/constants';
import './DemoApp.css';

// Root Component to demonstrate usage of embedded component
function DemoApp (): JSX.Element {

	// PowerBI Report object (to be received via callback)
	const [report, setReport] = useState<Report>();

	// Track Report embedding status
	const [isEmbedded, setIsEmbedded] = useState<boolean>(false);

    // Overall status message of embedding
	const [displayMessage, setMessage] = useState(`The report is bootstrapped. Click the Embed Report button to set the access token`);

	// CSS Class to be passed to the embedded component
	const reportClass = 'report-container';

	// Pass the basic embed configurations to the embedded component to bootstrap the report on first load
    // Values for properties like embedUrl, accessToken and settings will be set on click of button
	const [sampleReportConfig, setReportConfig] = useState<models.IReportEmbedConfiguration>({
		type: 'report',
		embedUrl: undefined,
		tokenType: models.TokenType.Embed,
		accessToken: undefined,
		settings: undefined,
	});

	/**
	 * Map of event handlers to be applied to the embedded report
	 * Update event handlers for the report by redefining the map using the setEventHandlersMap function
	 * Set event handler to null if event needs to be removed
	 * More events can be provided from here
	 * https://docs.microsoft.com/en-us/javascript/api/overview/powerbi/handle-events#report-events
	 */
	const[eventHandlersMap, setEventHandlersMap] = useState<Map<string, (event?: service.ICustomEvent<any>, embeddedEntity?: Embed) => void | null>>(new Map([
		['loaded', () => console.log('Report has loaded')],
		['rendered', () => console.log('Report has rendered')],
		['error', (event?: service.ICustomEvent<any>) => {
				if (event) {
					console.error(event.detail);
				}
			},
		],
		['visualClicked', () => console.log('visual clicked')],
		['pageChanged', (event) => console.log(event)],
	]));

	useEffect(() => {
		if (report) {
			report.setComponentTitle('Embedded Report');
		}
	}, [report]);

    /**
     * Embeds report
     *
     * @returns Promise<void>
     */
	const embedReport = async (): Promise<void> => {
		console.log('Embed Report clicked');

		// Get the embed config from the service
		const reportConfigResponse = await fetch(sampleReportUrl);

		if (reportConfigResponse === null) {
			return;
		}

		if (!reportConfigResponse?.ok) {
			console.error(`Failed to fetch config for report. Status: ${ reportConfigResponse.status } ${ reportConfigResponse.statusText }`);
			return;
		}

		const reportConfig = await reportConfigResponse.json();

		// Update the reportConfig to embed the PowerBI report
		setReportConfig({
			...sampleReportConfig,
			embedUrl: reportConfig.EmbedUrl,
			accessToken: reportConfig.EmbedToken.Token
		});
		setIsEmbedded(true);

		// Update the display message
		setMessage('Use the buttons above to interact with the report using Power BI Client APIs.');
	};

    /**
     * Hide Filter Pane
     *
     * @returns Promise<IHttpPostMessageResponse<void> | undefined>
     */
	const hideFilterPane = async (): Promise<IHttpPostMessageResponse<void> | undefined>  => {
		// Check if report is available or not
		if (!report) {
			setDisplayMessageAndConsole('Report not available');
			return;
		}

		// New settings to hide filter pane
		const settings = {
			panes: {
				filters: {
					expanded: false,
					visible: false,
				},
			},
		};

		try {
			const response: IHttpPostMessageResponse<void> = await report.updateSettings(settings);

			// Update display message
			setDisplayMessageAndConsole('Filter pane is hidden.');
			return response;
		} catch (error) {
			console.error(error);
			return;
		}
	};

    /**
     * Set data selected event
     *
     * @returns void
     */
	const setDataSelectedEvent = () => {
		setEventHandlersMap(new Map<string, (event?: service.ICustomEvent<any>, embeddedEntity?: Embed) => void | null> ([
			...eventHandlersMap,
			['dataSelected', (event) => console.log(event)],
		]));

		setMessage('Data Selected event set successfully. Select data to see event in console.');
	}

    /**
     * Change visual type
     *
     * @returns Promise<void>
     */
	const changeVisualType = async (): Promise<void> => {
		// Check if report is available or not
		if (!report) {
			setDisplayMessageAndConsole('Report not available');
			return;
		}

		// Get active page of the report
		const activePage: Page | undefined = await report.getActivePage();

		if (!activePage) {
			setMessage('No Active page found');
			return;
		}

		try {
			// Change the visual type using powerbi-report-authoring
			// For more information: https://docs.microsoft.com/en-us/javascript/api/overview/powerbi/report-authoring-overview
			const visual = await activePage.getVisualByName('VisualContainer6');

			const response = await visual.changeType('lineChart');

			setDisplayMessageAndConsole(`The ${visual.type} was updated to lineChart.`);

			return response;
		}
		catch (error) {
			if (error === 'PowerBIEntityNotFound') {
				console.log('No Visual found with that name');
			} else {
				console.log(error);
			}
		}
	};

	/**
     * Set display message and log it in the console
     *
     * @returns void
     */
	const setDisplayMessageAndConsole = (message: string): void => {
		setMessage(message);
		console.log(message);
	}

	const controlButtons =
		isEmbedded ?
		<>
			<button onClick = { changeVisualType }>
				Change visual type</button>

			<button onClick = { hideFilterPane }>
				Hide filter pane</button>

			<button onClick = { setDataSelectedEvent }>
				Set event</button>

			<label className = "display-message">
				{ displayMessage }
			</label>
		</>
		:
		<>
			<label className = "display-message position">
				{ displayMessage }
			</label>

			<button onClick = { embedReport } className = "embed-report">
				Embed Report</button>
		</>;

	const header =
		<div className = "header">Power BI Embedded React Component Demo</div>;

	const reportComponent =
		<PowerBIEmbed
			embedConfig = { sampleReportConfig }
			eventHandlers = { eventHandlersMap }
			cssClassName = { reportClass }
			getEmbeddedComponent = { (embedObject: Embed) => {
				console.log(`Embedded object of type "${ embedObject.embedtype }" received`);
				setReport(embedObject as Report);
			} }
		/>;

	const footer =
		<div className = "footer">
			<p>This demo is powered by Power BI Embedded Analytics</p>
			<label className = "separator-pipe">|</label>
			<img title = "Power-BI" alt = "PowerBI_Icon" className = "footer-icon" src = "./assets/PowerBI_Icon.png" />
			<p>Explore our<a href = "https://aka.ms/pbijs/" target = "_blank" rel = "noreferrer noopener">Playground</a></p>
			<label className = "separator-pipe">|</label>
			<img title = "GitHub" alt = "GitHub_Icon" className = "footer-icon" src = "./assets/GitHub_Icon.png" />
			<p>Find the<a href = "https://github.com/microsoft/PowerBI-client-react" target = "_blank" rel = "noreferrer noopener">source code</a></p>
		</div>;

	return (
		<div className = "container">
			{ header }

			<div className = "controls">
				{ controlButtons }

				{ isEmbedded ? reportComponent : null }
			</div>

			{ footer }
		</div>
	);
}

export default DemoApp;