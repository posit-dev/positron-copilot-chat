/*---------------------------------------------------------------------------------------------
 *  Copyright (C) 2025 Posit Software, PBC. All rights reserved.
 *  Licensed under the Elastic License 2.0. See LICENSE.txt for license information.
 *--------------------------------------------------------------------------------------------*/


import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { AuthenticationSession } from 'vscode';

/**
 * Try to get an authentication session from the GitHub Copilot apps.json file.
 * In Positron, this file is written after signing into the Copilot auth
 * provider via the LSP.
 *
 * @returns an auth session from the file, or undefined if the file doesn't
 * exist or can't be read
 */
export function getFileBasedAuthSession(): AuthenticationSession | undefined {
	try {
		let configDir: string;
		if (process.platform === 'win32') {
			// On Windows, use %APPDATA%
			configDir = path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'github-copilot');
		} else {
			// On Unix-like systems, use XDG_CONFIG_HOME or ~/.config
			const xdgConfigHome = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
			configDir = path.join(xdgConfigHome, 'github-copilot');
		}
		const appsJsonPath = path.join(configDir, 'apps.json');

		if (!fs.existsSync(appsJsonPath)) {
			return undefined;
		}

		const appsData = JSON.parse(fs.readFileSync(appsJsonPath, 'utf-8'));

		// Find the first available app entry
		const appId = Object.keys(appsData)[0];
		if (!appId) {
			return undefined;
		}

		const appData = appsData[appId];
		if (!appData.oauth_token || !appData.user) {
			return undefined;
		}

		// Create an AuthenticationSession compatible object
		return {
			id: appData.githubAppId || appId,
			accessToken: appData.oauth_token,
			account: {
				id: appData.user,
				label: appData.user
			},
			scopes: GITHUB_SCOPE_USER_EMAIL // Default to basic scope
		};
	} catch (error) {
		// If anything goes wrong, just return undefined and fall back to VS Code auth
		return undefined;
	}
}