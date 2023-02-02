// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const path = require('path');

module.exports = {
	mode: 'development',
	entry: {
		PowerBIEmbedTest: path.resolve('test/PowerBIEmbed.spec.tsx'),
		utilsTest: path.resolve('test/utils.spec.ts'),
	},
	output: {
		path: path.resolve('compiledTests'),
		filename: '[name].spec.js'
	},
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.ts(x)?$/,
				loader: 'ts-loader',
				options: {
					configFile: path.resolve('config/test/tsconfig.json')
				},
				exclude: /node_modules/
			},
		]
	},
	resolve: {
		extensions: [
			'.tsx',
			'.ts',
			'.js'
		]
	},
};