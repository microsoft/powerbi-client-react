// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import { service, factories, Report, Embed, Dashboard, Tile, Qna, IEmbedConfiguration, Visual } from 'powerbi-client';
import { IQnaEmbedConfiguration, IEmbedSettings, IVisualEmbedConfiguration } from "embed";
import { stringifyMap } from './utils';

/**
 * Props interface for PowerBIEmbed component
 */
export interface EmbedProps {

	// Configuration for embedding the PowerBI entity
	embedConfig: IEmbedConfiguration | IQnaEmbedConfiguration | IVisualEmbedConfiguration;

	// Callback method to get the embedded PowerBI entity object (Optional)
	getEmbeddedComponent?: { (embeddedComponent: Embed): void };

	// Map of pair of event name and its handler method to be triggered on the event (Optional)
	eventHandlers?: Map<string, service.IEventHandler<any> | null>;
	
	// CSS class to be set on the embedding container (Optional)
	cssClassName?: string;
	
	// Provide a custom implementation of PowerBI service (Optional)
	service?: service.Service;
}

export enum EmbedType {
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
	private embed?: Embed;

	// Powerbi service
	private powerbi: service.Service;

	// Ref to the HTML div element
	private containerRef = React.createRef<HTMLDivElement>();

	// JSON stringify of prev event handler map
	private prevEventHandlerMapString = '';

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
	};

	componentDidMount(): void {

		// Check if HTML container is available
		if (this.containerRef.current) {

			// Decide to bootstrap or embed
			if (this.props.embedConfig.accessToken && this.props.embedConfig.embedUrl) {
				this.embed = this.powerbi.embed(this.containerRef.current, this.props.embedConfig);
			}
			else {
				this.embed = this.powerbi.bootstrap(this.containerRef.current, this.props.embedConfig);
			}
		}

		// Invoke callback method in Props
		this.getEmbedCallback();

		// Set event handlers if available
		if (this.props.eventHandlers && this.embed) {
			this.setEventHandlers(this.embed, this.props.eventHandlers);
		}
	};

	componentDidUpdate(prevProps: EmbedProps): void {

		this.embedOrUpdateAccessToken(prevProps);

		// Set event handlers if available
		if (this.props.eventHandlers && this.embed) {
			this.setEventHandlers(this.embed, this.props.eventHandlers);
		}

		// Update settings in embedConfig of props
		this.updateSettings();
	};

	componentWillUnmount(): void {
		// Clean Up
		if (this.containerRef.current) {
			this.powerbi.reset(this.containerRef.current);
		}
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
	 * Choose to _embed_ the powerbi entity or _update the accessToken_ in the embedded entity 
	 * or do nothing when the embedUrl and accessToken did not update in the new props
	 * 
	 * @param prevProps EmbedProps
	 * @returns void
	 */
	private embedOrUpdateAccessToken(prevProps: EmbedProps): void {

		// Check if Embed URL and Access Token are present in current props
		if (!this.props.embedConfig.accessToken || !this.props.embedConfig.embedUrl) {
			return;
		}

		// Embed in the following scenarios
		//		1. AccessToken was not provided in prev props (E.g. Report was bootstrapped earlier)
		//		2. Embed URL is updated (E.g. New report is to be embedded)
		if (this.containerRef.current
			&& (!prevProps.embedConfig.accessToken
				|| this.props.embedConfig.embedUrl !== prevProps.embedConfig.embedUrl)) {
			this.embed = this.powerbi.embed(this.containerRef.current, this.props.embedConfig);
		}

		// Set new access token,
		// when access token is updated but embed Url is same
		else if (this.props.embedConfig.accessToken !== prevProps.embedConfig.accessToken
			&& this.props.embedConfig.embedUrl === prevProps.embedConfig.embedUrl
			&& this.embed) {

			this.embed.setAccessToken(this.props.embedConfig.accessToken)
				.catch(error => {
					console.error(`setAccessToken error: ${error}`); 
				});
		}
	
		// Invoke callback method in Props
		this.getEmbedCallback();
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
		eventHandlerMap: Map<string, service.IEventHandler<any> | null>): void {

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
			case EmbedType.Report:
				allowedEvents = [...allowedEvents, ...Report.allowedEvents]
				break;
			case EmbedType.Dashboard:
				allowedEvents = [...allowedEvents, ...Dashboard.allowedEvents]
				break;
			case EmbedType.Tile:
				allowedEvents = [...allowedEvents, ...Tile.allowedEvents]
				break;
			case EmbedType.Qna:
				allowedEvents = [...allowedEvents, ...Qna.allowedEvents]
				break;
			case EmbedType.Visual:
				allowedEvents = [...allowedEvents, ...Visual.allowedEvents]
				break;
			default:
				console.error(`Invalid embed type ${entityType}`);
		}

		// Holds list of events which are not allowed
		const invalidEvents: Array<string> = [];

		// Apply all provided event handlers
		eventHandlerMap.forEach(function (eventHandlerMethod, eventName) {

			// Check if this event is allowed
			if (allowedEvents.includes(eventName)) {

				// Removes event handler for this event
				embed.off(eventName);

				if (eventHandlerMethod) {

					// Set single event handler
					embed.on(eventName, eventHandlerMethod);
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
	private getEmbedCallback(): void {
		if (this.props.getEmbeddedComponent && this.embed) {
			this.props.getEmbeddedComponent(this.embed);
		}
	};

	/**
	 * Update settings from props of the embedded artifact
	 * 
	 * @returns void
	 */
	private updateSettings(): void {
		if (!this.embed || !this.props.embedConfig.settings) {
			return;
		} 

		switch (this.props.embedConfig.type) {
			case EmbedType.Report:

				// Typecasted to IEmbedSettings as props.embedConfig.settings can be ISettings via IQnaEmbedConfiguration
				const settings = this.props.embedConfig.settings as IEmbedSettings;

				// Upcast to Report and call updateSettings
				(this.embed as Report).updateSettings(settings)
					.catch((error: any) => {
						console.error(`Error in method updateSettings: ${error}`);
					});
				break;

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