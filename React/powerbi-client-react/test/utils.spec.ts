// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { EventHandler } from '../src/PowerBIEmbed';
import { stringifyMap } from '../src/utils';

describe('tests of PowerBIEmbed', function () {

	let container: HTMLDivElement | null;

	beforeEach(function () {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(function () {
		if (container){
			document.body.removeChild(container);
			container = null;
		}
	});

	// Tests for utils stringifyMap
	describe('tests PowerBIEmbed stringifyMap method', () => {

		it('stringifies the event handler map', () => {

			// Arrange
			const eventHandlerMap = new Map([
				['loaded', function () { console.log('Report loaded'); }],
				['rendered', function () { console.log('Rendered'); }]
			]);
			const expectedString = `[["loaded","function () { console.log('Report loaded'); }"],["rendered","function () { console.log('Rendered'); }"]]`;

			// Act
			const jsonStringOutput = stringifyMap(eventHandlerMap);

			// Assert
			expect(jsonStringOutput).toBe(expectedString);
		});

		it('stringifies empty event handler map', () => {

			// Arrange
			const eventHandlerMap = new Map<string, EventHandler>([]);
			const expectedString = `[]`;

			// Act
			const jsonStringOutput = stringifyMap(eventHandlerMap);

			// Assert
			expect(jsonStringOutput).toBe(expectedString);
		});

		it('stringifies null in event handler map', () => {

			// Arrange
			const eventHandlerMap = new Map<string, EventHandler>([
				['loaded', null],
				['rendered', function () { console.log('Rendered'); }]
			]);
			const expectedString = `[["loaded",""],["rendered","function () { console.log('Rendered'); }"]]`;

			// Act
			const jsonStringOutput = stringifyMap(eventHandlerMap);

			// Assert
			expect(jsonStringOutput).toBe(expectedString);
		});
	});
});