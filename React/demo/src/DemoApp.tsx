// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { models, Report, Embed, service } from 'powerbi-client';
import { IHttpPostMessageResponse } from 'http-post-message';
import { PowerBIEmbed } from 'powerbi-client-react';
import 'powerbi-report-authoring';

import './DemoApp.css';
import EmbedConfigDialog from './components/EmbedConfigDialogComponent';
import { sampleTheme } from './constants/constants';

// Root Component to demonstrate usage of embedded component
function DemoApp (): JSX.Element {

	// PowerBI Report object (to be received via callback)
	const [report, setReport] = useState<Report>();

	// Track Report embedding status
	const [isEmbedded, setIsEmbedded] = useState<boolean>(false);

	const [displayMessage, setMessage] = useState(`The report is bootstrapped. Click the Embed Report button to set the access token.`);
	const [isEmbedConfigDialogOpen, setIsEmbedConfigDialogOpen] = useState<boolean>(false);
	const [isFilterPaneVisibleAndExpanded, setIsFilterPaneVisibleAndExpanded] = useState<boolean>(true);
	const [isThemeApplied, setIsThemeApplied] = useState<boolean>(false);

	// CSS Class to be passed to the embedded component
	const reportClass = 'report-container';

	// Pass the basic embed configurations to the embedded component to bootstrap the report on first load
	// Values for properties like embedUrl, accessToken and settings will be set on click of button
	const [sampleReportConfig, setReportConfig] = useState<models.IReportEmbedConfiguration>({
		type: 'report',
		embedUrl: undefined,
		tokenType: models.TokenType.Aad,
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
	 */
	const embedReport = (embedUrl: string, accessToken: string): void => {
		// Update the reportConfig to embed the PowerBI report
		setReportConfig({
			...sampleReportConfig,
			embedUrl,
			accessToken
		});
		setIsEmbedded(true);

		setMessage('Use the buttons above to interact with the report using Power BI Client APIs.');
		setIsEmbedConfigDialogOpen(false);
	};

	/**
 	 * Toggle Filter Pane
 	 *
 	 * @returns Promise<IHttpPostMessageResponse<void> | undefined>
 	 */
	const toggleFilterPane = async (): Promise<IHttpPostMessageResponse<void> | undefined> => {
		// Check if report is available or not
		if (!report) {
			setDisplayMessageAndConsole('Report not available');
			return;
		}

		const filterPaneVisibleAndExpanded = !isFilterPaneVisibleAndExpanded;
		setIsFilterPaneVisibleAndExpanded(filterPaneVisibleAndExpanded);

		// Update the settings to show/hide the filter pane
		const settings = {
			panes: {
				filters: {
					expanded: filterPaneVisibleAndExpanded,
					visible: filterPaneVisibleAndExpanded,
				},
			},
		};

		try {
			const response: IHttpPostMessageResponse<void> = await report.updateSettings(settings);
			setDisplayMessageAndConsole(filterPaneVisibleAndExpanded ? 'Filter pane is visible.' : 'Filter pane is hidden.');
			return response;
		} catch (error) {
			console.error(error);
			return;
		}
	};

	/**
	 * Set data selected event
 	 */
	const setDataSelectedEvent = () => {
		// Adding dataSelected event in eventHandlersMap
		setEventHandlersMap(new Map<string, (event?: service.ICustomEvent<any>, embeddedEntity?: Embed) => void | null> ([
			...eventHandlersMap,
			['dataSelected', (event) => console.log(event)],
		]));

		setMessage('Data Selected event set successfully. Select data to see event in console.');
	}

	/**
 	 * Toggle theme
	 *
	 * @returns Promise<void>
	 */
	const toggleTheme = async (): Promise<void> => {
		// Check if report is available or not
		if (!report) {
			setDisplayMessageAndConsole('Report not available');
			return;
		}

		// Update the theme by passing in the custom theme.
		// Some theme properties might not be applied if your report has custom colors set.
		try {
			await isThemeApplied ? report.resetTheme() : report.applyTheme({ themeJson: sampleTheme });
			const themeApplied = !isThemeApplied;
			setIsThemeApplied(themeApplied);
			setDisplayMessageAndConsole(themeApplied ? "Theme has been applied." : "Theme has been reset to default.");
		} catch (error) {
			setDisplayMessageAndConsole("Failed to apply theme.");
			console.error(error);
		}
	};

	/**
     * Set display message and log it in the console
     */
	const setDisplayMessageAndConsole = (message: string): void => {
		setMessage(message);
		console.log(message);
	}

	const controlButtons =
		isEmbedded ?
		<>
			<button onClick = { toggleFilterPane }>
				{ isFilterPaneVisibleAndExpanded ? "Hide filter pane" : "Show filter pane" }</button>

			<button onClick = { setDataSelectedEvent }>
				Set 'dataSelected' event</button>

			<button onClick = {toggleTheme}>
				{ isThemeApplied ? "Reset theme" : "Set theme" }</button>

			<label className = "display-message">
				{ displayMessage }
			</label>
		</>
		:
		<>
			<label className = "display-message position">
				{ displayMessage }
			</label>

			<button className = "embed-report" onClick = {() => setIsEmbedConfigDialogOpen(true)}>
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
			<p>Explore our <a href = "https://aka.ms/pbijs/" target = "_blank" rel = "noreferrer noopener">Playground</a></p>
			<label className = "separator-pipe">|</label>
			<img title = "GitHub" alt = "GitHub_Icon" className = "footer-icon" src = "./assets/GitHub_Icon.png" />
			<p>Find the <a href = "https://github.com/microsoft/PowerBI-client-react" target = "_blank" rel = "noreferrer noopener">source code</a></p>
		</div>;

	return (
		<div className = "container">
			{ header }

			<div className = "controls">
				{ controlButtons }

				{ isEmbedded ? reportComponent : null }
			</div>

			<EmbedConfigDialog
				isOpen = {isEmbedConfigDialogOpen}
				onRequestClose = {() => setIsEmbedConfigDialogOpen(false)}
				onEmbed = {embedReport}
			/>

			{ footer }
		</div>
	);
}

export default DemoApp;