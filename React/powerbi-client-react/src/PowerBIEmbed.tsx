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
	IQnaEmbedConfiguration,
	IVisualEmbedConfiguration,
	IReportEmbedConfiguration,
	IDashboardEmbedConfiguration,
	ITileEmbedConfiguration,
} from 'powerbi-client';
import { IReportCreateConfiguration, IPaginatedReportLoadConfiguration } from 'powerbi-models';
import isEqual from 'lodash.isequal';
import { stringifyMap, SdkType, SdkWrapperVersion } from './utils';

/**
 * Type for event handler function of embedded entity
 */
export type EventHandler = ((event?: service.ICustomEvent<any>, embeddedEntity?: Embed) => void) | null;

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

		// Set event handlers if available
		if (this.props.eventHandlers && this.embed) {
			this.setEventHandlers(this.embed, this.props.eventHandlers);
		}

		// Re-embed when the current embedConfig differs from the previous embedConfig
		if(!isEqual(this.props.embedConfig, prevProps.embedConfig)){
			this.embedEntity();
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
		// Ensure that the HTML container is rendered and available
		// Also check if the Embed URL and Access Token are present in current props
		if (!this.containerRef.current || !this.props.embedConfig.accessToken || !this.props.embedConfig.embedUrl) {
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
}