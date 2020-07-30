// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import 'react-app-polyfill/ie11';	// For PhantomJS compatibility
import 'react-app-polyfill/stable';	// For PhantomJS compatibility
import React from 'react';
import ReactDOM from 'react-dom';
import { act, isElement } from 'react-dom/test-utils';
import { Report, Dashboard, service, factories} from 'powerbi-client';
import { PowerBIEmbed } from '../src/PowerBIEmbed';
import { mockPowerBIService, mockedMethods } from "./mockService";

describe('tests of PowerBIEmbed', function () {

	let container: HTMLDivElement | null;

	beforeEach(function () {
		container = document.createElement('div');
		document.body.appendChild(container);

		// Reset all methods in PowerBI Service spy object
		mockedMethods.forEach(mockedMethod => {
			mockPowerBIService[mockedMethod].calls.reset();
		});
	});
  
	afterEach(function () {
		if (container){
			document.body.removeChild(container);
			container = null;
		}
	});

	describe('basic tests', function () {

		it('is a react component', () => {
			const component = <PowerBIEmbed embedConfig={{ type: 'report' }} />
			expect(isElement(component)).toBe(true);
		});
	
		it('renders exactly one div', () => {
			act(() => {
				ReactDOM.render(<PowerBIEmbed embedConfig = {{type: 'report'}}/>, container);
			});
	
			const divCount = container.querySelectorAll('div').length;
			expect(divCount).toBe(1);
		});
	
		it('renders exactly one iframe', () => {
			act(() => {
				ReactDOM.render(<PowerBIEmbed embedConfig = {{type: 'report'}}/>, container);
			});
	
			const divCount = container.querySelectorAll('iframe').length;
			expect(divCount).toBe(1);
		});
	
		it('sets the css classes', () => {
			const inputCssClass = 'test-class another-test-class';
			
			act(() => {
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = {{type: 'report'}} 
						cssClassName = {inputCssClass}/>
					, container);
			});
	
			const divClass = container.querySelectorAll('div')[0].className;
			expect(divClass).toBe(inputCssClass);
		});
	
		it('gets the embedded report object', () => {
			let testReport = undefined;
	
			act(() => {
	
				ReactDOM.render(
					<PowerBIEmbed
						embedConfig={{ type: 'report' }}
						getEmbeddedComponent={(callbackReport) => {
							testReport = callbackReport;
						}}
					/>, container);
			});
	
			expect(testReport).not.toBe(undefined);
			expect(testReport instanceof Report).toBe(true);
		});

		it('gets the embedded dashboard object', () => {
			let testReport = undefined;
	
			act(() => {
	
				ReactDOM.render(
					<PowerBIEmbed
						embedConfig={{ type: 'dashboard' }}
						getEmbeddedComponent={(callbackReport) => {
							testReport = callbackReport;
						}}
					/>, container);
			});
	
			expect(testReport).not.toBe(undefined);
			expect(testReport instanceof Dashboard).toBe(true);
		});
	});

	it('updates powerbi report settings', () => {
		let testReport: Report = undefined;

		act(() => {

			ReactDOM.render(
				<PowerBIEmbed
					embedConfig={{ type: 'report' }}
					getEmbeddedComponent={(callbackReport: Report) => {
						testReport = callbackReport;
					}}
				/>, container);
		});
		
		spyOn(testReport, 'updateSettings').and.callThrough();

		// Update settings via props
		act(() => {

			ReactDOM.render(
				<PowerBIEmbed
					embedConfig={{ type: 'report', settings: { filterPaneEnabled: false } }}
					getEmbeddedComponent={(callbackReport: Report) => {
						testReport = callbackReport;
					}}
				/>, container);
		});

		expect(testReport.updateSettings).toHaveBeenCalledTimes(1);
		expect(testReport.updateSettings).toHaveBeenCalledWith({ filterPaneEnabled: false });
	});

	it('sets new token received in updated props (case: Token expired)', () => {
		
		// Arrange
		let testReport:Report = undefined;
		let config = {
			type: 'report',
			id: 'fakeId',
			embedUrl: 'fakeUrl',
			accessToken: 'fakeToken'
		};

		// New accessToken
		let newConfig = {
			type: 'report',
			id: 'fakeId',
			embedUrl: 'fakeUrl',
			accessToken: 'newfakeToken'
		};
		
		act(() => {
			
			ReactDOM.render(
				<PowerBIEmbed 
					embedConfig = { config } 
					getEmbeddedComponent = {(callbackReport:Report) => {
						testReport = callbackReport;
					}}
				/>, container);
		});
		
		spyOn(testReport, 'setAccessToken').and.callThrough();
	
		// Act
		// Update accessToken via props
		act(() => {

			ReactDOM.render(
				<PowerBIEmbed 
					embedConfig = { newConfig } 
					getEmbeddedComponent = {(callbackReport:Report) => {
						testReport = callbackReport;
					}}
				/>, container);
		});

		// Assert
		expect(testReport).toBeDefined();
		expect(testReport.setAccessToken).toHaveBeenCalledTimes(1);
		expect(testReport.setAccessToken).toHaveBeenCalledWith(newConfig.accessToken);
	});

	describe('test powerbi service interaction',() => {

		it('embeds report when accessToken provided', () => {
			let config = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'fakeUrl',
				accessToken: 'fakeToken'
			};
	
			act(() => {
	
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { config }
						service = { mockPowerBIService }
					/>, container);
			});
	
			expect(mockPowerBIService.bootstrap).toHaveBeenCalledTimes(0);
			expect(mockPowerBIService.embed).toHaveBeenCalledTimes(1);
		});
	
		it('bootstraps report when no accessToken provided', () => {
			let config = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'fakeUrl'
			};
	
			act(() => {
	
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { config }
						service = { mockPowerBIService }
					/>, container);
			});
	
			expect(mockPowerBIService.embed).toHaveBeenCalledTimes(0);
			expect(mockPowerBIService.bootstrap).toHaveBeenCalledTimes(1);
		});

		it('first bootstraps, then embeds when accessToken is available', () => {

			// Arrange
			const config = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'fakeUrl',
				accessToken: null
			};
			const newConfig = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'fakeUrl',
				accessToken: 'fakeToken'
			};
	
			// Act
			// Without accessToken (bootstrap)
			act(() => {
	
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { config }
						service = { mockPowerBIService }
					/>, container);
			});

			// Assert
			expect(mockPowerBIService.embed).toHaveBeenCalledTimes(0);
			expect(mockPowerBIService.bootstrap).toHaveBeenCalledTimes(1);

			// Reset for next Act
			mockPowerBIService.embed.calls.reset();
			mockPowerBIService.bootstrap.calls.reset();

			// With accessToken (embed)
			act(() => {
	
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { newConfig }
						service = { mockPowerBIService }
					/>, container);
			});
	
			expect(mockPowerBIService.bootstrap).toHaveBeenCalledTimes(0);
			expect(mockPowerBIService.embed).toHaveBeenCalledTimes(1);
		});

		it('does not embed again when accessToken and embedUrl are same', () => {
			const config = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'fakeUrl',
				accessToken: 'fakeToken',
			};
			const newConfig = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'fakeUrl',
				accessToken: 'fakeToken',
				settings: { filterPaneEnabled: false }
			};
	
			act(() => {

				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { config }
						service = { mockPowerBIService }
					/>, container);
			});

			expect(mockPowerBIService.embed).toHaveBeenCalledTimes(1);
			mockPowerBIService.embed.calls.reset();

			// With accessToken (embed)
			act(() => {
	
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { newConfig }
						service = { mockPowerBIService }
					/>, container);
			});
	
			expect(mockPowerBIService.embed).not.toHaveBeenCalled();
		});

		it('powerbi.reset called when component unmounts', () => {
			let config = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'fakeUrl',
				accessToken: 'fakeToken'
			};
	
			act(() => {
	
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { config }
						service = { mockPowerBIService }
					/>, container);
			});

			act(() => {
	
				ReactDOM.unmountComponentAtNode(container);
			});
	
			expect(mockPowerBIService.reset).toHaveBeenCalled();
		});

		it("embeds when report's embedUrl is updated in new props", () => {
			let config = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'fakeUrl',
				accessToken: 'fakeToken'
			};
	
			act(() => {
	
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { config }
						service = { mockPowerBIService }
					/>, container);
			});

			// Embed URL of different report
			config.embedUrl = 'newFakeUrl';

			act(() => {
	
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { config }
						service = { mockPowerBIService }
					/>, container);
			});

			expect(mockPowerBIService.embed).toHaveBeenCalled();
		});

		it('loads the report when phasedEmbedding props is true', () => {

			// Arrange
			const config = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'fakeUrl',
				accessToken: 'fakeToken'
			};
	
			// Act
			act(() => {
	
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { config }
						service = { mockPowerBIService }
						phasedEmbedding = { true }
					/>, 
					container
				);
			});

			// Assert
			// service.load() is invoked once
			expect(mockPowerBIService.load).toHaveBeenCalledTimes(1);

			// service.embed() is not invoked
			expect(mockPowerBIService.embed).not.toHaveBeenCalled();
		});

		it('embeds the report when phasedEmbedding props is null', () => {

			// Arrange
			const config = {
				type: 'report',
				id: 'fakeId',
				embedUrl: 'fakeUrl',
				accessToken: 'fakeToken'
			};
	
			// Act
			act(() => {
	
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { config }
						service = { mockPowerBIService }
						phasedEmbedding = { null }
					/>, 
					container
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
				embedUrl: 'fakeUrl',
				accessToken: 'fakeToken'
			};
	
			// Act
			act(() => {
	
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { config }
						service = { mockPowerBIService }
					/>, 
					container
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
			let mockgetEmbeddedComponent = jasmine.createSpy('getEmbeddedComponent');

			// Act
			act(() => {
	
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { {
							type:'report',
							id: 'fakeId',
							embedUrl: 'fakeUrl',
							accessToken: 'fakeToken'
						} }
						getEmbeddedComponent = {mockgetEmbeddedComponent}
					/>, container);
			});

			// Assert
			expect(mockgetEmbeddedComponent).toHaveBeenCalledTimes(1);
		});

		it('invokes getEmbeddedComponent once on embed and not on settings update', () => {
			// Arrange
			let mockgetEmbeddedComponent = jasmine.createSpy('getEmbeddedComponent');

			// Act
			act(() => {
	
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { {
							type:'report',
							id: 'fakeId',
							embedUrl: 'fakeUrl',
							accessToken: 'fakeToken'
						} }
						getEmbeddedComponent = {mockgetEmbeddedComponent}
					/>, container);
			});

			// Update settings
			act(() => {
	
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { {
							type:'report',
							id: 'fakeId',
							embedUrl: 'fakeUrl',
							accessToken: 'fakeToken',
							settings: {
								panes: {
									filters: {
										visible: false
									}
								}
							}
						} }
						getEmbeddedComponent = {mockgetEmbeddedComponent}
					/>, container);
			});

			// Assert
			expect(mockgetEmbeddedComponent).toHaveBeenCalledTimes(1);
		});
	});

	describe('tests for setting event handlers', () => {
		it('clears and sets the event handlers', () => {
			// Arrange
			let testReport:Report = undefined;
			let eventHandlers = new Map([
				['loaded', function () { }],
				['rendered', function () { }],
				['error', function () { }]
			]);

			// Initialise testReport
			act(() => {
	
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { {type:'report'} }
						getEmbeddedComponent = {(callbackReport:Report) => {
							testReport = callbackReport;
						}}
					/>, container);
			});

			spyOn(testReport, 'off');
			spyOn(testReport, 'on');

			// Act
			act(() => {
	
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { {type:'report'} }
						eventHandlers = { eventHandlers }
					/>, container);
			});

			// Assert
			expect(testReport.off).toHaveBeenCalledTimes(eventHandlers.size);
			expect(testReport.on).toHaveBeenCalledTimes(eventHandlers.size);
		});

		it('clears the already set event handlers in case of null provided for handler', () => {
			// Arrange
			let testReport:Report = undefined;
			const eventHandlers = new Map([
				['loaded', function () { }],
				['rendered', function () { }],
				['error', function () { }]
			]);
			const newEventHandlers = new Map([
				['loaded', null],
				['rendered', null],
				['error', function () { }]
			]);

			// Initialise testReport
			act(() => {
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { {type:'report'} }
						getEmbeddedComponent = {(callbackReport:Report) => {
							testReport = callbackReport;
						}}
					/>, container);
			});

			spyOn(testReport, 'off');
			spyOn(testReport, 'on');

			// Act
			act(() => {
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { {type:'report'} }
						eventHandlers = { newEventHandlers }
					/>, container);
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

			act(() => {
				ReactDOM.render(
					<PowerBIEmbed
						embedConfig={{ type: 'report' }}
						eventHandlers={eventHandlers}
					/>, container);
			});
	
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
			const embed = powerbi.bootstrap(container, {type:'tile'});
	
			spyOn(console, 'error');
			
			// Act
			const powerbiembed = new PowerBIEmbed({
				embedConfig: { type: 'tile' },
				eventHandlers: eventHandlers
			});

			// Ignoring next line as setEventHandlers is a private method
			// @ts-ignore
			powerbiembed.setEventHandlers(embed, eventHandlers);

			expect(console.error).toHaveBeenCalledWith(errorMessage);
		});

		it('does not set the same eventhandler map again', () => {
			// Arrange
			let testReport:Report = undefined;
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
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { {type:'report'} }
						getEmbeddedComponent = {(callbackReport:Report) => {
							testReport = callbackReport;
						}}
						eventHandlers = { eventHandlers }
					/>, container);
			});

			spyOn(testReport, 'off');
			spyOn(testReport, 'on');

			// Act
			act(() => {
				ReactDOM.render(
					<PowerBIEmbed 
						embedConfig = { {type:'report'} }
						eventHandlers = { newSameEventHandlers }
					/>, container);
			});

			// Assert
			expect(testReport.off).not.toHaveBeenCalled();
			expect(testReport.on).not.toHaveBeenCalled();
		});
	});
});
