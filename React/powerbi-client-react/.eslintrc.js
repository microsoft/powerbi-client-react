// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = {
	parser: "@typescript-eslint/parser", // Specifies the ESLint parser
	extends: [
		"eslint:recommended",
		"plugin:react/recommended", // Uses the recommended rules from @eslint-plugin-react
		"plugin:@typescript-eslint/recommended" // Uses the recommended rules from @typescript-eslint/eslint-plugin
	],
	parserOptions: {
		ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
		sourceType: "module", // Allows for the use of imports
		ecmaFeatures: {
			jsx: true // Allows for the parsing of JSX
		},
	},
	rules: {
		"prefer-const": "warn",
		"no-var": "error",
		'@typescript-eslint/no-this-alias': [
			'error',
			{
				allowDestructuring: true, // Allow `const { props, state } = this`; false by default
				allowedNames: ['thisObj'], // Allow `const self = this`; `[]` by default
			},
		],
		'@typescript-eslint/no-empty-interface': [
			'error',
			{
				allowSingleExtends: true
			}
		],
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-extra-semi": "off"
	},
	settings: {
		react: {
			version: "detect" // Tells eslint-plugin-react to automatically detect the version of React to use
		}
	}
};