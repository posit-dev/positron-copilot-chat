/*---------------------------------------------------------------------------------------------
 *  Copyright (C) 2025 Posit Software, PBC. All rights reserved.
 *  Licensed under the Elastic License 2.0. See LICENSE.txt for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check

'use strict';

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

// Custom webpack plugin to use esbuild for the vscode-node target
class ESBuildPlugin {
	apply(compiler) {
		compiler.hooks.run.tapAsync('ESBuildPlugin', async (compilation, callback) => {
			await this.build();
			callback();
		});

		compiler.hooks.watchRun.tapAsync('ESBuildPlugin', async (compilation, callback) => {
			await this.build();
			callback();
		});
	}

	async build() {
		const isDev = process.env.NODE_ENV === 'development';

		// Base esbuild options matching the .esbuild.ts configuration for vscode-node target
		/** @type {import('esbuild').BuildOptions} */
		const buildOptions = {
			bundle: true,
			logLevel: 'info',
			minify: !isDev,
			outdir: path.resolve(__dirname, './dist'),
			sourcemap: isDev ? 'linked' : false,
			sourcesContent: false,
			treeShaking: true,
			external: [
				// Build-time files that shouldn't be bundled
				'./package.json',
				'./.vscode-test.mjs',

				// Test/dev dependencies that shouldn't be bundled
				'playwright',

				// Native modules that are provided by the runtime environment
				'keytar',
				'zeromq',
				'electron',
				'sqlite3',

				// Optional dependencies for monitoring/telemetry that may not be available
				'@azure/functions-core',
				'applicationinsights-native-metrics',
				'@opentelemetry/instrumentation',
				'@azure/opentelemetry-instrumentation-azure-sdk',

				// VS Code provided APIs
				'vscode',
				'@vscode/prompt-tsx',
			],
			platform: 'node',
			format: 'cjs', // Force CommonJS output format
			mainFields: ["module", "main"],
			define: {
				'process.env.APPLICATIONINSIGHTS_CONFIGURATION_CONTENT': '"{}"'
			},
			entryPoints: [
				{ in: path.resolve(__dirname, './src/extension/extension/vscode-node/extension.ts'), out: 'extension' },
				{ in: path.resolve(__dirname, './src/platform/parser/node/parserWorker.ts'), out: 'worker2' },
				{ in: path.resolve(__dirname, './src/platform/tokenizer/node/tikTokenizerWorker.ts'), out: 'tikTokenizerWorker' },
				{ in: path.resolve(__dirname, './src/platform/diff/node/diffWorkerMain.ts'), out: 'diffWorker' },
				{ in: path.resolve(__dirname, './src/platform/tfidf/node/tfidfWorker.ts'), out: 'tfidfWorker' },
				{ in: path.resolve(__dirname, './src/extension/onboardDebug/node/copilotDebugWorker/index.ts'), out: 'copilotDebugCommand' },
			],
			loader: { '.ps1': 'text' },
			absWorkingDir: __dirname
		};

		try {
			await esbuild.build(buildOptions);
			console.log('ESBuild completed successfully');
		} catch (error) {
			console.error('ESBuild failed:', error);
			throw error;
		}
	}
}

// Create a minimal webpack config that just uses our esbuild plugin
const config = {
	mode: 'development',
	// Use a dummy entry since ESBuild handles the real entry point
	entry: './package.json',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'dummy.js', // Use a different filename to avoid conflicts
		libraryTarget: 'commonjs2'
	},
	plugins: [
		new ESBuildPlugin(),
		// Clean up the dummy file after ESBuild runs
		{
			apply(compiler) {
				compiler.hooks.afterEmit.tap('CleanupDummyFile', () => {
					const dummyFile = path.resolve(__dirname, 'dist', 'dummy.js');
					if (fs.existsSync(dummyFile)) {
						fs.unlinkSync(dummyFile);
					}
				});
			}
		}
	],
	resolve: {
		extensions: ['.ts', '.js']
	},
	externals: {
		vscode: 'commonjs vscode'
	}
};

module.exports = config;
