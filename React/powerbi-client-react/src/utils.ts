// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { EmbedProps } from "./PowerBIEmbed";

/**
 * Get JSON string representation of the given map.
 *
 * @param map Map of event and corresponding handler method
 *
 * For example:
 * Input:
 * ```
 *  Map([
		['loaded', null],
		['rendered', function () { console.log('Rendered'); }]
	]);
 * ```
 * Output:
 * ```
 * `[["loaded",""],["rendered","function () { console.log('Rendered'); }"]]`
 * ```
 */
export function stringifyMap(map: EmbedProps['eventHandlers']): string {

	// Return empty string for empty/null map
	if (!map) {
		return '';
	}

	// Get entries of map as array
	const mapEntries = Array.from(map);

	// Return JSON string
	return JSON.stringify(mapEntries.map((mapEntry) => {

		// Convert event handler method to a string containing its source code for comparison
		return [
			mapEntry[0],
			mapEntry[1] ? mapEntry[1].toString() : ''
		];
	}));
};

// SDK information to be used with service instance
export const SdkType = "powerbi-client-react";
export const SdkWrapperVersion = "2.0.0";