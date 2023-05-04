// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import {
	service,
	factories,
	Report,
	Embed,
	Dashboard,
	Tile,
	Qna,
	Visual,
	IEmbedSettings,
	IQnaEmbedConfiguration,
	IVisualEmbedConfiguration,
	IReportEmbedConfiguration,
	IDashboardEmbedConfiguration,
	ITileEmbedConfiguration,
} from 'powerbi-client';
import { IReportCreateConfiguration, IPaginatedReportLoadConfiguration, ReportLevelFilters, FiltersOperations } from 'powerbi-models';
import isEqual from 'lodash.isequal';
import { stringifyMap, SdkType, SdkWrapperVersion } from './utils';

/**
 * Type for event handler function of embedded entity
 */
export type EventHandler = {
	(event?: service.ICustomEvent<any>, embeddedEntity?: Embed): void | null;
};

/**
 * Props interface for PowerBIEmbed component
 */
export interface EmbedProps {

	// Configuration for embedding the PowerBI entity (Required)
	embedConfig:
		| IReportEmbedConfiguration
		| IDashboardEmbedConfiguration
		| ITileEmbedConfiguration
		| IQnaEmbedConfiguration
		| IVisualEmbedConfiguration
		| IPaginatedReportLoadConfiguration
		| IReportCreateConfiguration;

	// Callback method to get the embedded PowerBI entity object (Optional)
	getEmbeddedComponent?: { (embeddedComponent: Embed): void };

	// Map of pair of event name and its handler method to be triggered on the event (Optional)
	eventHandlers?: Map<string, EventHandler>;

	// CSS class to be set on the embedding container (Optional)
	cssClassName?: string;

	// Phased embedding flag (Optional)
	phasedEmbedding?: boolean;

	// Provide a custom implementation of PowerBI service (Optional)
	service?: service.Service;
}

export enum EmbedType {
	Create = 'create',
	Report = 'report',
	Dashboard = 'dashboard',
	Tile = 'tile',
	Qna = 'qna',
	Visual = 'visual'
}

/**
 * Base react component to embed Power BI entities like: reports, dashboards, tiles, visual and qna containers.
 */
export class PowerBIEmbed extends React.Component<EmbedProps> {

	// Embedded entity
	// Note: Do not read or assign to this member variable directly, instead use the getter and setter
	private _embed?: Embed;

	// Powerbi service
	private powerbi: service.Service;

	// Ref to the HTML div element
	private containerRef = React.createRef<HTMLDivElement>();

	// JSON stringify of prev event handler map
	private prevEventHandlerMapString = '';

	// Getter for this._embed
	private get embed(): Embed | undefined {
		return this._embed;
	};

	// Setter for this._embed
	private set embed(newEmbedInstance: Embed | undefined) {
		this._embed = newEmbedInstance;

		// Invoke callback method in props to return this embed instance
		this.invokeGetEmbedCallback();
	};

	constructor(props: EmbedProps) {
		super(props);

		if (this.props.service) {
			this.powerbi = this.props.service;
		}
		else {
			this.powerbi = new service.Service(
				factories.hpmFactory,
				factories.wpmpFactory,
				factories.routerFactory);
		}

		this.powerbi.setSdkInfo(SdkType, SdkWrapperVersion);
	};

	componentDidMount(): void {

		// Check if HTML container is available
		if (this.containerRef.current) {

			// Decide to embed, load or bootstrap
			if (this.props.embedConfig.accessToken && this.props.embedConfig.embedUrl) {
				this.embedEntity();
			}
			else {
				this.embed = this.powerbi.bootstrap(this.containerRef.current, this.props.embedConfig);
			}
		}

		// Set event handlers if available
		if (this.props.eventHandlers && this.embed) {
			this.setEventHandlers(this.embed, this.props.eventHandlers);
		}
	};

	async componentDidUpdate(prevProps: EmbedProps): Promise<void> {

		this.embedOrUpdateAccessToken(prevProps);

		// Set event handlers if available
		if (this.props.eventHandlers && this.embed) {
			this.setEventHandlers(this.embed, this.props.eventHandlers);
		}

		// Allow settings update only when settings object in embedConfig of current and previous props is different
		if (!isEqual(this.props.embedConfig.settings, prevProps.embedConfig.settings)) {
			await this.updateSettings();
		}

		// Update pageName and filters for a report
		if (this.props.embedConfig.type === EmbedType.Report) {
			try {
				// Typecasting to IReportEmbedConfiguration
				const embedConfig = this.props.embedConfig as IReportEmbedConfiguration;
				const filters = embedConfig.filters as ReportLevelFilters[];
				const prevEmbedConfig = prevProps.embedConfig as IReportEmbedConfiguration;

				// Set new page if available and different from the previous page
				if (embedConfig.pageName && embedConfig.pageName !== prevEmbedConfig.pageName) {
					// Upcast to Report and call setPage
					await (this.embed as Report).setPage(embedConfig.pageName);
				}

				// Set filters on the embedded report if available and different from the previous filter
				if (filters && !isEqual(filters, prevEmbedConfig.filters)) {
					// Upcast to Report and call updateFilters with the Replace filter operation
					await (this.embed as Report).updateFilters(FiltersOperations.Replace, filters);
				}

				// Remove filters on the embedded report, if previously applied
				else if (!filters && prevEmbedConfig.filters) {
					// Upcast to Report and call updateFilters with the RemoveAll filter operation
					await (this.embed as Report).updateFilters(FiltersOperations.RemoveAll);
				}
			} catch (err) {
				console.error(err);
			}
		}
	};

	componentWillUnmount(): void {
		// Clean Up
		if (this.containerRef.current) {
			this.powerbi.reset(this.containerRef.current);
		}

		// Set the previous event handler map string to empty
		this.prevEventHandlerMapString = '';
	};

	render(): JSX.Element {
		return (
			<div
				ref={this.containerRef}
				className={this.props.cssClassName}>
			</div>
		)
	};

	/**
	 * Embed the powerbi entity (Load for phased embedding)
	 */
	private embedEntity(): void {
		// Check if the HTML container is rendered and available
		if (!this.containerRef.current) {
			return;
		}

		// Load when props.phasedEmbedding is true and embed type is report, embed otherwise
		if (this.props.phasedEmbedding && this.props.embedConfig.type === EmbedType.Report) {
			this.embed = this.powerbi.load(this.containerRef.current, this.props.embedConfig);
		}
		else {
			if (this.props.phasedEmbedding) {
				console.error(`Phased embedding is not supported for type ${this.props.embedConfig.type}`)
			}

			if (this.props.embedConfig.type === EmbedType.Create) {
				this.embed = this.powerbi.createReport(this.containerRef.current, this.props.embedConfig as IReportCreateConfiguration);
			}
			else {
				this.embed = this.powerbi.embed(this.containerRef.current, this.props.embedConfig);
			}
		}
	}

	/**
	 * When component updates, choose to _embed_ the powerbi entity or _update the accessToken_ in the embedded entity
	 * or do nothing if the embedUrl and accessToken did not update in the new props
	 *
	 * @param prevProps EmbedProps
	 * @returns void
	 */
	private async embedOrUpdateAccessToken(prevProps: EmbedProps): Promise<void> {

		// Check if Embed URL and Access Token are present in current props
		if (!this.props.embedConfig.accessToken || !this.props.embedConfig.embedUrl) {
			return;
		}

		// Embed or load in the following scenarios
		//		1. AccessToken was not provided in prev props (E.g. Report was bootstrapped earlier)
		//		2. Embed URL is updated (E.g. New report is to be embedded)
		if (
			this.containerRef.current &&
			(!prevProps.embedConfig.accessToken ||
				this.props.embedConfig.embedUrl !== prevProps.embedConfig.embedUrl)
		) {
			this.embedEntity();
		}

		// Set new access token,
		// when access token is updated but embed Url is same
		else if (
			this.props.embedConfig.accessToken !== prevProps.embedConfig.accessToken &&
			this.props.embedConfig.embedUrl === prevProps.embedConfig.embedUrl &&
			this.embed
		) {
			try {
				await this.embed.setAccessToken(this.props.embedConfig.accessToken);
			} catch(error) {
				console.error("setAccessToken error:\n", error);
			}
		}
	}

	/**
	 * Sets all event handlers from the props on the embedded entity
	 *
	 * @param embed Embedded object
	 * @param eventHandlers Array of eventhandlers to be set on embedded entity
	 * @returns void
	 */
	private setEventHandlers(
		embed: Embed,
		eventHandlerMap: Map<string, EventHandler>
	): void {
		// Get string representation of eventHandlerMap
		const eventHandlerMapString = stringifyMap(this.props.eventHandlers);

		// Check if event handler map changed
		if (this.prevEventHandlerMapString === eventHandlerMapString) {
			return;
		}

		// Update prev string representation of event handler map
		this.prevEventHandlerMapString = eventHandlerMapString;

		// List of allowed events
		let allowedEvents = Embed.allowedEvents;

		const entityType = embed.embedtype;

		// Append entity specific events
		switch (entityType) {
			case EmbedType.Create:
				break;
			case EmbedType.Report:
				allowedEvents = [...allowedEvents, ...Report.allowedEvents];
				break;
			case EmbedType.Dashboard:
				allowedEvents = [...allowedEvents, ...Dashboard.allowedEvents];
				break;
			case EmbedType.Tile:
				allowedEvents = [...allowedEvents, ...Tile.allowedEvents];
				break;
			case EmbedType.Qna:
				allowedEvents = [...allowedEvents, ...Qna.allowedEvents];
				break;
			case EmbedType.Visual:
				allowedEvents = [...allowedEvents, ...Visual.allowedEvents];
				break;
			default:
				console.error(`Invalid embed type ${entityType}`);
		}

		// Holds list of events which are not allowed
		const invalidEvents: Array<string> = [];

		// Apply all provided event handlers
		eventHandlerMap.forEach((eventHandlerMethod, eventName) => {
			// Check if this event is allowed
			if (allowedEvents.includes(eventName)) {

				// Removes event handler for this event
				embed.off(eventName);

				// Event handler is effectively removed for this event when eventHandlerMethod is null
				if (eventHandlerMethod) {

					// Set single event handler
					embed.on(eventName, (event: service.ICustomEvent<any>): void => {
						eventHandlerMethod(event, this.embed);
					});
				}
			}
			else {

				// Add this event name to the list of invalid events
				invalidEvents.push(eventName);
			}
		});

		// Handle invalid events
		if (invalidEvents.length) {
			console.error(`Following events are invalid: ${invalidEvents.join(',')}`);
		}
	};

	/**
	 * Returns the embedded object via _getEmbed_ callback method provided in props
	 *
	 * @returns void
	 */
	private invokeGetEmbedCallback(): void {
		if (this.props.getEmbeddedComponent && this.embed) {
			this.props.getEmbeddedComponent(this.embed);
		}
	};

	/**
	 * Update settings from props of the embedded artifact
	 *
	 * @returns void
	 */
	private async updateSettings(): Promise<void> {
		if (!this.embed || !this.props.embedConfig.settings) {
			return;
		}

		switch (this.props.embedConfig.type) {
			case EmbedType.Report: {
				// Typecasted to IEmbedSettings as props.embedConfig.settings can be ISettings via IQnaEmbedConfiguration
				const settings = this.props.embedConfig.settings as IEmbedSettings;

				try {
					// Upcast to Report and call updateSettings
					await (this.embed as Report).updateSettings(settings);
				} catch (error) {
					console.error(`Error in method updateSettings: ${error}`);
				}

				break;
			}
			case EmbedType.Dashboard:
			case EmbedType.Tile:
			case EmbedType.Qna:
			case EmbedType.Visual:
				// updateSettings not applicable for these embedding types
				break;

			default:
				console.error(`Invalid embed type ${this.props.embedConfig.type}`);
		}
	};
}
