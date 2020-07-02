// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const path = require('path');

module.exports = {
	mode: 'development',
	entry: path.resolve('index.tsx'),
	output: {
		path: __dirname,
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.ts(x)?$/,
				loader: 'ts-loader'
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader'
				]
			},
		]
	},
	resolve: {
		extensions: [
			'.tsx',
			'.ts',
			'.js',
		]
	},
	devtool: 'source-map',
};