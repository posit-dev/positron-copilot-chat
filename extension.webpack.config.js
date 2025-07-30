/*---------------------------------------------------------------------------------------------
 *  Copyright (C) 2025 Posit Software, PBC. All rights reserved.
 *  Licensed under the Elastic License 2.0. See LICENSE.txt for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check

'use strict';

const withDefaults = require('../shared.webpack.config');

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = withDefaults({
	context: __dirname,
	mode: 'development', // Disable minification
	entry: {
		extension: './src/extension/extension/vscode-node/extension.ts',
	},
	resolve: {
		alias: {
			// Alias the common crypto file to use Node.js crypto instead
			'../../../util/common/crypto': path.resolve(__dirname, 'src/util/common/crypto-redirect.ts')
		}
	},
	node: {
		__dirname: false
	},
	externals: {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'@vscode/prompt-tsx': 'commonjs @vscode/prompt-tsx'
	},
	optimization: {
		minimize: false // Explicitly disable minification
	}
});

// Add our script file loader to the existing rules
config.module.rules.push({
	test: /\.(ps1|sh)$/,
	type: 'asset/source'
});

// Replace the CopyWebpackPlugin with our custom one that excludes script files
config.plugins = config.plugins.map(plugin => {
	if (plugin.constructor.name === 'CopyWebpackPlugin') {
		return new CopyWebpackPlugin({
			patterns: [
				{ 
					from: 'src', 
					to: '.', 
					globOptions: { 
						ignore: ['**/test/**', '**/*.ts', '**/*.tsx', '**/*.sh', '**/*.ps1', '**/script/**'] 
					}, 
					noErrorOnMissing: true 
				}
			]
		});
	}
	return plugin;
});

module.exports = config;
