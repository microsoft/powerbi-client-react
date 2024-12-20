// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { models, Report, Embed, service } from 'powerbi-client';
import { IHttpPostMessageResponse } from 'http-post-message';
import { PowerBIEmbed } from 'powerbi-client-react';
import 'powerbi-report-authoring';

import './DemoApp.css';
import EmbedConfigDialog from './components/embed-config-dialog/EmbedConfigDialogComponent';
import EventDetailsDialog from './components/event-details-dialog/EventDetailsDialogComponent';
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
	const [isZoomedOut, setIsZoomedOut] = useState<boolean>(false);
	const [isDataSelectedEvent, setIsDataSelectedEvent] = useState<boolean>(false);
	const [isEventDetailsDialogVisible, setIsEventDetailsDialogVisible] = useState<boolean>(false);
	const [dataSelectedEventDetails, setDataSelectedEventDetails] = useState<any>(null);

	// Constants for zoom levels
	const zoomOutLevel = 0.5;
	const zoomInLevel = 0.9;

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
	 * Handles the visibility and details of the data-selected event dialog.
 	 */
	const dataSelectedEventDetailsDialog = (dataSelectedEventDetails: any): void => {
		setDataSelectedEventDetails(dataSelectedEventDetails);
		setIsEventDetailsDialogVisible(true);
	}

	/**
	 * Set data selected event
 	 */
	const setDataSelectedEvent = () => {
		const dataSelectedEvent = !isDataSelectedEvent;
		setIsDataSelectedEvent(dataSelectedEvent);

		if(dataSelectedEvent) {
			// Adding dataSelected event in eventHandlersMap
			setEventHandlersMap(new Map<string, (event?: service.ICustomEvent<any>, embeddedEntity?: Embed) => void | null> ([
				...eventHandlersMap,
				['dataSelected', (event) => {
					if (event?.detail.dataPoints.length) {
						dataSelectedEventDetailsDialog(event.detail);
					}
				}],
			]));

			setMessage('Data Selected event has been successfully set. Click on a data point to see the details.');
		}
		else {
			eventHandlersMap.delete('dataSelected');
			report?.off('dataSelected');
			setMessage('Data Selected event has been successfully unset.')
		}
	}

	/**
 	 * Toggle theme
	 *
	 * @returns Promise<void>
	 */
	const toggleTheme = async (): Promise<void> => {
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
	 * Toggle zoom
	 *
	 * @returns Promise<void>
	 */
	const toggleZoom = async (): Promise<void> => {
		if (!report) {
			setDisplayMessageAndConsole('Report not available');
			return;
		}

		try {
			const newZoomLevel: number = isZoomedOut ? zoomInLevel : zoomOutLevel;
			await report.setZoom(newZoomLevel);
			setIsZoomedOut(!isZoomedOut);
		}
		catch (errors) {
			console.log(errors);
		}
	}

	/**
	 * Refresh report event
	 *
	 * @returns Promise<void>
	 */
	const refreshReport = async (): Promise<void> => {
		if (!report) {
			setDisplayMessageAndConsole('Report not available');
			return;
		}

		try {
			await report.refresh();
			setDisplayMessageAndConsole('The report has been refreshed successfully.');
		}
		catch (error: any) {
			setDisplayMessageAndConsole(error.detailedMessage);
		}
	}

	/**
	 * Full screen event
	 */
	const enableFullScreen = (): void => {
		if (!report) {
			setDisplayMessageAndConsole('Report not available');
			return;
		}

		report.fullscreen();
	}


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
			<div className = "button-container">
				<button onClick = { toggleFilterPane }>
					{ isFilterPaneVisibleAndExpanded ? "Hide filter pane" : "Show filter pane" }</button>

				<button onClick = { toggleTheme }>
					{ isThemeApplied ? "Reset theme" : "Set theme" }</button>

				<button onClick = { setDataSelectedEvent }>
					{ isDataSelectedEvent ? "Hide dataSelected event in dialog" : "Show dataSelected event in dialog" }</button>

				<button onClick = { toggleZoom }>
					{ isZoomedOut ? "Zoom in" : "Zoom out" }</button>

				<button onClick = { refreshReport }>
					Refresh report</button>

				<button onClick = { enableFullScreen }>
					Full screen</button>
			</div>

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
		<div className = "footer" aria-hidden = {isEmbedConfigDialogOpen || isEventDetailsDialogVisible}>
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

			<div className = "controls" aria-hidden = {isEmbedConfigDialogOpen || isEventDetailsDialogVisible}>
				{ controlButtons }

				{ isEmbedded ? reportComponent : null }
			</div>

			<EmbedConfigDialog
				isOpen = {isEmbedConfigDialogOpen}
				onRequestClose = {() => setIsEmbedConfigDialogOpen(false)}
				onEmbed = {embedReport}
			/>

			<EventDetailsDialog
				isOpen = {isEventDetailsDialogVisible}
				onRequestClose = {() => setIsEventDetailsDialogVisible(false)}
				dataSelectedEventDetails = {dataSelectedEventDetails}
			/>

			{ footer }
		</div>
	);
}

export default DemoApp;