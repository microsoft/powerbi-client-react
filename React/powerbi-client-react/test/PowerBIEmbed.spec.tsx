// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { isValidElement } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Report, Dashboard, service, factories, IEmbedSettings, IReportEmbedConfiguration, Embed } from 'powerbi-client';
import { IBasicFilter, FilterType, FiltersOperations } from 'powerbi-models';
import { act } from "@testing-library/react";

import { mockPowerBIService, mockedMethods } from "./mockService";
import { PowerBIEmbed, EventHandler } from '../src/PowerBIEmbed';
import { stringifyMap } from '../src/utils';

// Use this function to render powerbi entity with only config
function renderReport(config, root: Root) {
	let testReport!: Report;
	act(() => {
		root.render(
			<PowerBIEmbed
				embedConfig={config}
				getEmbeddedComponent={(callbackReport: Embed) => {
					testReport = callbackReport as Report;
				}}
			/>
		)
	});
	return testReport;
}

describe('tests of PowerBIEmbed', function () {

	let container: HTMLDivElement;
	let root: Root;

	const filter: IBasicFilter = {
		$schema: 'fakeSchema',
		target: {
			table: 'fakeTable',
			column: 'fakeRegion'
		},
		filterType: FilterType.Basic,
		operator: 'In',
		values: ['fakeValue']
	}

	beforeEach(function () {
		container = document.createElement('div');
		document.body.appendChild(container);
		root = createRoot(container);

		// Reset all methods in PowerBI Service spy object
		mockedMethods.forEach(mockedMethod => {
			mockPowerBIService[mockedMethod].calls.reset();
		});
	});

	afterEach(function () {
		if (container) {
			document.body.removeChild(container);
			container = document.createElement('div'); // Reset to an empty div;
		}
	});

	describe('basic tests', function () {

		it('is a react component', () => {
			const component = <PowerBIEmbed embedConfig={{ type: 'report' }} />

			// Assert
			expect(isValidElement(component)).toBe(true);
		});

		it('renders exactly one div', () => {

			// Act
			act(() => {
				root.render(<PowerBIEmbed embedConfig={{ type: 'report' }} />);
			});

			const divCount = container.querySelectorAll('div').length;

			// Assert
			expect(divCount).toBe(1);
		});

		it('renders exactly one iframe', () => {

			// Act
			act(() => {
				root.render(<PowerBIEmbed embedConfig={{ type: 'report' }} />);
			});

			const divCount = container?.querySelectorAll('iframe').length;

			// Assert
			expect(divCount).toBe(1);
		});

		it('sets the css classes', () => {

			// Arrange
			const inputCssClass = 'test-class another-test-class';

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={{ type: 'report' }}
						cssClassName={inputCssClass}
					/>
				);
			});

			const divClass = container?.querySelectorAll('div')[0].className;

			// Assert
			expect(divClass).toBe(inputCssClass);
		});

		it('gets the embedded report object', () => {

			// Act
			const testReport = renderReport({ type: 'report' }, root);

			// Assert
			expect(testReport).toBeDefined();
			expect(testReport instanceof Report).toBe(true);
		});

		it('gets the embedded dashboard object', () => {

			// Act
			const testReport = renderReport({ type: 'dashboard' }, root);

			// Assert
			expect(testReport).toBeDefined();
			expect(testReport instanceof Dashboard).toBe(true);
		});
	});

	describe('tests of powerbi report update settings', function () {

		it('does not updates powerbi report settings when settings are not changed in config', () => {

			// Arrange
			let testReport = renderReport({ type: 'report' }, root);

			spyOn(testReport, 'updateSettings').and.callThrough();

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={{ type: 'report' }}
						getEmbeddedComponent={(callbackReport: Embed) => {
							testReport = callbackReport as Report;
						}}
					/>
				);
			});

			// Assert
			expect(testReport.updateSettings).toHaveBeenCalledTimes(0);
		});

		it('updates powerbi report settings once when settings are changed in config', () => {

			// Arrange
			const settingsObj: IEmbedSettings = { filterPaneEnabled: false };
			let testReport = renderReport({ type: 'report' }, root);

			spyOn(testReport, 'updateSettings').and.callThrough();

			// Act
			// Update settings via props
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={{ type: 'report', settings: settingsObj }}
						getEmbeddedComponent={(callbackReport: Embed) => {
							testReport = callbackReport as Report;
						}}
					/>
				);
			});

			// Assert
			expect(testReport.updateSettings).toHaveBeenCalledTimes(1);
			expect(testReport.updateSettings).toHaveBeenCalledWith(settingsObj);
		});

		it('updates powerbi report settings once with passing same settings twice', () => {

			// Arrange
			const settingsObj: IEmbedSettings = { filterPaneEnabled: false };
			let testReport = renderReport({ type: 'report' }, root);

			spyOn(testReport, 'updateSettings').and.callThrough();

			// Update settings via props
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={{ type: 'report', settings: settingsObj }}
						getEmbeddedComponent={(callbackReport: Embed) => {
							testReport = callbackReport as Report;
						}}
					/>
				);
			});

			// Act
			// Pass same settings via props
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={{ type: 'report', settings: settingsObj }}
						getEmbeddedComponent={(callbackReport: Embed) => {
							testReport = callbackReport as Report;
						}}
					/>
				);
			});

			// Assert
			expect(testReport.updateSettings).toHaveBeenCalledTimes(1);
			expect(testReport.updateSettings).toHaveBeenCalledWith(settingsObj);
		});

		it('updates powerbi report settings twice with passing different settings', () => {

			// Arrange
			const settingsObject: IEmbedSettings = { filterPaneEnabled: false };
			const updatedSettingsObject: IEmbedSettings = { filterPaneEnabled: true };
			let testReport = renderReport({ type: 'report' }, root);

			spyOn(testReport, 'updateSettings').and.callThrough();

			// Act
			// Update settings via props
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={{ type: 'report', settings: settingsObject }}
						getEmbeddedComponent={(callbackReport: Embed) => {
							testReport = callbackReport as Report;
						}}
					/>
				);
			});

			// Assert
			expect(testReport.updateSettings).toHaveBeenCalledTimes(1);
			expect(testReport.updateSettings).toHaveBeenCalledWith(settingsObject);

			// Act
			// Update diffferent settings via props
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={{ type: 'report', settings: updatedSettingsObject }}
						getEmbeddedComponent={(callbackReport: Embed) => {
							testReport = callbackReport as Report;
						}}
					/>
				);
			});

			// Assert
			expect(testReport.updateSettings).toHaveBeenCalledTimes(2);
			expect(testReport.updateSettings).toHaveBeenCalledWith(updatedSettingsObject);
		});
	});

	it('sets new token received in updated props (case: Token expired)', () => {

		// Arrange
		const config = {
			type: 'report',
			id: 'fakeId',
			embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
			accessToken: 'fakeToken'
		};

		// New accessToken
		const newConfig = {
			type: 'report',
			id: 'fakeId',
			embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
			accessToken: 'newfakeToken'
		};

		let testReport = renderReport(config, root);
		spyOn(testReport, 'setAccessToken').and.callThrough();

		// Act
		// Update accessToken via props
		act(() => {
			root.render(
				<PowerBIEmbed
					embedConfig={newConfig}
					getEmbeddedComponent={(callbackReport: Embed) => {
						testReport = callbackReport as Report;
					}}
				/>
			);
		});

		// Assert
		expect(testReport).toBeDefined();
		expect(testReport.setAccessToken).toHaveBeenCalledTimes(1);
		expect(testReport.setAccessToken).toHaveBeenCalledWith(newConfig.accessToken);
	});

	describe('test powerbi updating report filters', () => {
		it('applies the updated filter', () => {

			// Arrange
			const config = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
				accessToken: 'fakeToken',
				filters: [filter],
			};

			let testReport = renderReport({ type: 'report' }, root);
			spyOn(testReport, 'updateFilters').and.callThrough();

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={config}
						getEmbeddedComponent={(callbackReport: Embed) => {
							testReport = callbackReport as Report;
						}}
					/>
				);
			});

			// Assert
			expect(testReport.updateFilters).toHaveBeenCalledTimes(1);
			expect(testReport.updateFilters).toHaveBeenCalledWith(FiltersOperations.Replace, config.filters);
		});

		it('does not apply filter if same filter is provided in the new config', () => {

			// Arrange
			const oldConfig = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
				accessToken: 'fakeToken',
				filters: [filter]
			};

			const newConfig = {
				...oldConfig,
				filters: [filter]
			};
			let testReport = renderReport(oldConfig, root);

			spyOn(testReport, 'updateFilters').and.callThrough();

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={newConfig}
						getEmbeddedComponent={(callbackReport: Embed) => {
							testReport = callbackReport as Report;
						}}
					/>
				);
			});

			// Assert
			expect(testReport.updateFilters).toHaveBeenCalledTimes(0);
		});

		it('calls setFilters but does not apply filters if updated filter is of type models.OnLoadFilters', () => {

			// Arrange
			const oldConfig: IReportEmbedConfiguration = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
				accessToken: 'fakeToken',
				filters: {}
			};

			const newConfig: IReportEmbedConfiguration = {
				...oldConfig,
				filters: {
					allPages: { operation: FiltersOperations.Add }	// OnLoadFilter
				}
			};

			let testReport = renderReport(oldConfig, root);

			spyOn(testReport, 'updateFilters').and.callThrough();

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={newConfig}
						getEmbeddedComponent={(callbackReport: Embed) => {
							testReport = callbackReport as Report;
						}}
					/>
				);
			});

			// Assert
			expect(testReport.updateFilters).toHaveBeenCalledTimes(1);
		});

		it('removes the filters if the filters were provided in old props but removed in new props', () => {

			// Arrange
			const oldConfig = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
				accessToken: 'fakeToken',
				filters: [filter],
			};

			const newConfig = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'https://app.powerbi.com/newFakeEmbedUrl',
				accessToken: 'fakeToken',
			};

			let testReport = renderReport(oldConfig, root);

			spyOn(testReport, 'updateFilters').and.callThrough();

			// Act
			// Remove any applied filters via props
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={newConfig}
						getEmbeddedComponent={(callbackReport: Embed) => {
							testReport = callbackReport as Report;
						}}
					/>
				);
			});

			// Assert
			expect(testReport.updateFilters).toHaveBeenCalledTimes(1);
			expect(testReport.updateFilters).toHaveBeenCalledWith(FiltersOperations.RemoveAll);
		});
	});

	describe('test powerbi changing report page', () => {
		it('changes report page when provided', () => {

			// Arrange
			const config = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
				accessToken: 'fakeToken',
				pageName: 'fakePage',
			};

			let testReport = renderReport({ type: 'report' }, root);
			spyOn(testReport, 'setPage').and.callThrough();

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={config}
						getEmbeddedComponent={(callbackReport: Embed) => {
							testReport = callbackReport as Report;
						}}
					/>
				);
			});

			// Assert
			expect(testReport.setPage).toHaveBeenCalledTimes(1);
			expect(testReport.setPage).toHaveBeenCalledWith(config.pageName);
		});

		it('does not change report page when not provided', () => {

			// Arrange
			const config = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
				accessToken: 'fakeToken',
			};

			let testReport = renderReport({ type: 'report' }, root);
			spyOn(testReport, 'setPage').and.callThrough();

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={config}
						getEmbeddedComponent={(callbackReport: Embed) => {
							testReport = callbackReport as Report;
						}}
					/>
				);
			});

			// Assert
			expect(testReport.setPage).toHaveBeenCalledTimes(0);
		});

		it('does not change report page when same page is provide in the old props and new props', () => {

			// Arrange
			const oldConfig = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
				accessToken: 'fakeToken',
				pageName: 'fakePage'
			};
			const newConfig = {
				...oldConfig,
				pageName: 'fakePage'
			};

			let testReport = renderReport(oldConfig, root);

			spyOn(testReport, 'setPage').and.callThrough();

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={newConfig}
						getEmbeddedComponent={(callbackReport: Embed) => {
							testReport = callbackReport as Report;
						}}
					/>
				);
			});

			// Assert
			expect(testReport.setPage).toHaveBeenCalledTimes(0);
		});
	});

	describe('test powerbi service interaction', () => {

		it('embeds report when accessToken provided', () => {

			// Arrange
			const config = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
				accessToken: 'fakeToken'
			};

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={config}
						service={mockPowerBIService}
					/>
				);
			});

			// Assert
			expect(mockPowerBIService.bootstrap).toHaveBeenCalledTimes(0);
			expect(mockPowerBIService.embed).toHaveBeenCalledTimes(1);
		});

		it('bootstraps report when no accessToken provided', () => {

			// Arrange
			const config = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'https://app.powerbi.com/fakeEmbedUrl'
			};

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={config}
						service={mockPowerBIService}
					/>
				);
			});

			// Assert
			expect(mockPowerBIService.embed).toHaveBeenCalledTimes(0);
			expect(mockPowerBIService.bootstrap).toHaveBeenCalledTimes(1);
		});

		it('first bootstraps, then embeds when accessToken is available', () => {

			// Arrange
			const config = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
				accessToken: undefined
			};
			const newConfig = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'https://app.powerbi.com/newFakeEmbedUrl',
				accessToken: 'fakeToken'
			};

			// Act
			// Without accessToken (bootstrap)
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={config}
						service={mockPowerBIService}
					/>
				);
			});

			// Assert
			expect(mockPowerBIService.embed).toHaveBeenCalledTimes(0);
			expect(mockPowerBIService.bootstrap).toHaveBeenCalledTimes(1);

			// Reset for next Act
			mockPowerBIService.embed.calls.reset();
			mockPowerBIService.bootstrap.calls.reset();

			// Act
			// With accessToken (embed)
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={newConfig}
						service={mockPowerBIService}
					/>
				);
			});

			// Assert
			expect(mockPowerBIService.bootstrap).toHaveBeenCalledTimes(0);
			expect(mockPowerBIService.embed).toHaveBeenCalledTimes(1);
		});

		it('does not embed again when accessToken and embedUrl are same', () => {
			const config = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
				accessToken: 'fakeToken',
			};
			const newConfig = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
				accessToken: 'fakeToken',
				settings: { filterPaneEnabled: false }
			};

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={config}
						service={mockPowerBIService}
					/>
				);
			});

			// Assert
			expect(mockPowerBIService.embed).toHaveBeenCalledTimes(1);
			mockPowerBIService.embed.calls.reset();

			// Act
			// With accessToken (embed)
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={newConfig}
						service={mockPowerBIService}
					/>
				);
			});

			// Assert
			expect(mockPowerBIService.embed).not.toHaveBeenCalled();
		});

		it('powerbi.reset called when component unmounts', () => {
			// Arrange
			const config = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
				accessToken: 'fakeToken'
			};

			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={config}
						service={mockPowerBIService}
					/>
				);
			});

			// Act
			act(() => {
				root.unmount();
			});

			// Assert
			expect(mockPowerBIService.reset).toHaveBeenCalled();
		});

		it("embeds when report's embedUrl is updated in new props", () => {

			// Arrange
			const config = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
				accessToken: 'fakeToken'
			};

			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={config}
						service={mockPowerBIService}
					/>
				);
			});

			// Embed URL of different report
			config.embedUrl = 'https://app.powerbi.com/newFakeEmbedUrl';

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={config}
						service={mockPowerBIService}
					/>
				);
			});

			// Assert
			expect(mockPowerBIService.embed).toHaveBeenCalled();
		});

		it('loads the report when phasedEmbedding props is true', () => {

			// Arrange
			const config = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
				accessToken: 'fakeToken'
			};

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={config}
						service={mockPowerBIService}
						phasedEmbedding={true}
					/>
				);
			});

			// Assert
			// service.load() is invoked once
			expect(mockPowerBIService.load).toHaveBeenCalledTimes(1);

			// service.embed() is not invoked
			expect(mockPowerBIService.embed).not.toHaveBeenCalled();
		});

		it('embeds the powerbi entity when phasedEmbedding props is true but embed type is not report', () => {

			// Arrange
			const config = {
				type: 'dashboard',
				id: 'fakeId',
				embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
				accessToken: 'fakeToken'
			};

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={config}
						service={mockPowerBIService}
						phasedEmbedding={true}
					/>
				);
			});

			// Assert
			// service.load() is not invoked
			expect(mockPowerBIService.load).not.toHaveBeenCalled();

			// service.embed() is invoked once
			expect(mockPowerBIService.embed).toHaveBeenCalledTimes(1);
		});

		it('embeds the report when phasedEmbedding props is undefined', () => {

			// Arrange
			const config = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
				accessToken: 'fakeToken'
			};

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={config}
						service={mockPowerBIService}
						phasedEmbedding={undefined}
					/>
				);
			});

			// Assert
			// service.load() is not invoked
			expect(mockPowerBIService.load).not.toHaveBeenCalled();

			// service.embed() is invoked once
			expect(mockPowerBIService.embed).toHaveBeenCalledTimes(1);
		});

		it('embeds the report when phasedEmbedding props is not provided', () => {

			// Arrange
			const config = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
				accessToken: 'fakeToken'
			};

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={config}
						service={mockPowerBIService}
					/>
				);
			});

			// Assert
			// service.load() is not invoked
			expect(mockPowerBIService.load).not.toHaveBeenCalled();

			// service.embed() is invoked once
			expect(mockPowerBIService.embed).toHaveBeenCalledTimes(1);
		});
	});

	describe('tests for getEmbeddedComponent callback', () => {
		it('invokes getEmbeddedComponent on embed', () => {

			// Arrange
			const mockgetEmbeddedComponent = jasmine.createSpy('getEmbeddedComponent');

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={{
							type: 'report',
							id: 'fakeId',
							embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
							accessToken: 'fakeToken'
						}}
						getEmbeddedComponent={mockgetEmbeddedComponent}
					/>
				);
			});

			// Assert
			expect(mockgetEmbeddedComponent).toHaveBeenCalledTimes(1);
		});

		it('invokes getEmbeddedComponent once on embed and not on settings update', () => {

			// Arrange
			const mockgetEmbeddedComponent = jasmine.createSpy('getEmbeddedComponent');
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={{
							type: 'report',
							id: 'fakeId',
							embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
							accessToken: 'fakeToken'
						}}
						getEmbeddedComponent={mockgetEmbeddedComponent}
					/>
				);
			});

			// Act
			// Update settings
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={{
							type: 'report',
							id: 'fakeId',
							embedUrl: 'https://app.powerbi.com/fakeEmbedUrl',
							accessToken: 'fakeToken',
							settings: {
								panes: {
									filters: {
										visible: false
									}
								}
							}
						}}
						getEmbeddedComponent={mockgetEmbeddedComponent}
					/>
				);
			});

			// Assert
			expect(mockgetEmbeddedComponent).toHaveBeenCalledTimes(1);
		});
	});

	describe('tests for setting event handlers', () => {
		it('test event handlers are setting when remounting twice', () => {
			// Arrange
			const eventHandlers = new Map([
				['loaded', function () { }],
				['rendered', function () { }],
				['error', function () { }]
			]);

			const powerbi = new service.Service(
				factories.hpmFactory,
				factories.wpmpFactory,
				factories.routerFactory);
			const embed = powerbi.bootstrap(container, { type: 'report' });

			// Act
			const powerbiembed = new PowerBIEmbed({
				embedConfig: { type: 'report' },
				eventHandlers: eventHandlers
			});

			// Ignoring next line as setEventHandlers is a private method
			// @ts-ignore
			powerbiembed.setEventHandlers(embed, eventHandlers);
			powerbiembed.componentWillUnmount();
			expect((powerbiembed as any).prevEventHandlerMapString).toBe('');
			powerbiembed.componentDidMount();
			// @ts-ignore
			powerbiembed.setEventHandlers(embed, eventHandlers);

			// Assert
			expect((powerbiembed as any).prevEventHandlerMapString).toBe(stringifyMap(eventHandlers));
		});

		it('clears and sets the event handlers', () => {

			// Arrange
			const eventHandlers = new Map([
				['loaded', function () { }],
				['rendered', function () { }],
				['error', function () { }]
			]);

			// Initialise testReport
			const testReport = renderReport({ type: 'report' }, root);

			spyOn(testReport, 'off');
			spyOn(testReport, 'on');

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={{ type: 'report' }}
						eventHandlers={eventHandlers}
					/>
				);
			});

			// Assert
			expect(testReport.off).toHaveBeenCalledTimes(eventHandlers.size);
			expect(testReport.on).toHaveBeenCalledTimes(eventHandlers.size);
		});

		it('clears the already set event handlers in case of null provided for handler', () => {

			// Arrange
			const eventHandlers = new Map([
				['loaded', function () { }],
				['rendered', function () { }],
				['error', function () { }]
			]);
			const newEventHandlers = new Map<string, EventHandler>([
				['loaded', null],
				['rendered', null],
				['error', function () { }]
			]);

			// Initialise testReport
			const testReport = renderReport({ type: 'report' }, root);

			spyOn(testReport, 'off');
			spyOn(testReport, 'on');

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={{ type: 'report' }}
						eventHandlers={newEventHandlers}
					/>
				);
			});

			// Assert
			expect(testReport.off).toHaveBeenCalledTimes(eventHandlers.size);
			// Two events are turned off in new eventhandlers
			expect(testReport.on).toHaveBeenCalledTimes(eventHandlers.size - 2);
		});

		it('does not console error for valid events for report', () => {
			const eventHandlers = new Map([
				['loaded', function () { }],
				['saved', function () { }],
				['rendered', function () { }],
				['saveAsTriggered', function () { }],
				['dataSelected', function () { }],
				['buttonClicked', function () { }],
				['filtersApplied', function () { }],
				['pageChanged', function () { }],
				['commandTriggered', function () { }],
				['swipeStart', function () { }],
				['swipeEnd', function () { }],
				['bookmarkApplied', function () { }],
				['dataHyperlinkClicked', function () { }],
				['error', function () { }]
			]);

			spyOn(console, 'error');

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={{ type: 'report' }}
						eventHandlers={eventHandlers}
					/>
				);
			});

			// Assert
			expect(console.error).not.toHaveBeenCalled();
		});

		it('consoles error for invalid events', () => {
			// Arrange
			const invalidEvent1 = 'invalidEvent1';
			const invalidEvent2 = 'invalidEvent2';
			const errorMessage = `Following events are invalid: ${invalidEvent1},${invalidEvent2}`;

			const eventHandlers = new Map([
				[invalidEvent1, function () { }],
				['rendered', function () { }],
				['error', function () { }],
				[invalidEvent2, function () { }],
			]);

			const powerbi = new service.Service(
				factories.hpmFactory,
				factories.wpmpFactory,
				factories.routerFactory);
			const embed = powerbi.bootstrap(container, { type: 'tile' });

			spyOn(console, 'error');

			// Act
			const powerbiembed = new PowerBIEmbed({
				embedConfig: { type: 'tile' },
				eventHandlers: eventHandlers
			});

			// Ignoring next line as setEventHandlers is a private method
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			powerbiembed.setEventHandlers(embed, eventHandlers);

			// Assert
			expect(console.error).toHaveBeenCalledWith(errorMessage);
		});

		it('does not set the same eventhandler map again', () => {

			// Arrange
			let testReport!: Report;
			const eventHandlers = new Map([
				['loaded', function () { }],
				['rendered', function () { }],
				['error', function () { }]
			]);
			const newSameEventHandlers = new Map([
				['loaded', function () { }],
				['rendered', function () { }],
				['error', function () { }]
			]);

			// Initialise testReport
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={{ type: 'report' }}
						getEmbeddedComponent={(callbackReport: Embed) => {
							testReport = callbackReport as Report;
						}}
						eventHandlers={eventHandlers}
					/>
				);
			});

			spyOn(testReport, 'off');
			spyOn(testReport, 'on');

			// Act
			act(() => {
				root.render(
					<PowerBIEmbed
						embedConfig={{ type: 'report' }}
						eventHandlers={newSameEventHandlers}
					/>
				);
			});

			// Assert
			expect(testReport.off).not.toHaveBeenCalled();
			expect(testReport.on).not.toHaveBeenCalled();
		});
	});
});