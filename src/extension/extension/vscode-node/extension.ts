/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ExtensionContext } from 'vscode';
import { resolve } from '../../../util/vs/base/common/path';
import { baseActivate } from '../vscode/extension';
import { vscodeNodeContributions } from './contributions';
import { registerServices } from './services';

// ###############################################################################################
// ###                                                                                         ###
// ###                 Node extension that runs ONLY in node.js extension host.                ###
// ###                                                                                         ###
// ### !!! Prefer to add code in ../vscode/extension.ts to support all extension runtimes !!!  ###
// ###                                                                                         ###
// ###############################################################################################

//#region TODO@bpasero this needs cleanup
import '../../intents/node/allIntents';

// --- Start Positron ---
import * as vscode from 'vscode';
import { getFileBasedAuthSession } from '../../../platform/authentication/vscode-node/fileBasedAuth.js';
// --- End Positron ---

function configureDevPackages() {
	try {
		const sourceMapSupport = require('source-map-support');
		sourceMapSupport.install();
		const dotenv = require('dotenv');
		dotenv.config({ path: [resolve(__dirname, '../.env')] });
	} catch (err) {
		console.error(err);
	}
}
//#endregion

export function activate(context: ExtensionContext, forceActivation?: boolean) {

	// --- Start Positron ---
	// Don't enable the extension when Assistant is disabled
	const enabled =
		vscode.workspace.getConfiguration('positron.assistant').get('enable');
	if (!enabled) {
		console.log(`[Copilot Chat] Disabling since Assistant is disabled`);
		return;
	}

	// Don't perform activation if we have no auth session; the original
	// extension has an "installed but not signed in" state, but we don't
	// support that in Positron.
	const authSession = getFileBasedAuthSession();
	if (!authSession) {
		// There's no auth session yet, but we don't want to require a restart
		// when one is established. Listen for a Copilot auth session to be
		// established.
		console.log(`[Copilot Chat] No auth session found, extension will not activate until sign-in`);
		const api = vscode.extensions.getExtension('positron.positron-assistant')?.exports;
		if (api) {
			api.onProviderSignIn((provider: string) => {
				if (provider === 'copilot') {
					console.info('[Copilot Chat] Detected Copilot sign-in, activating extension');
					activate(context, forceActivation);
				}
			});
		} else {
			console.error('[Copilot Chat] Failed to get Positron API');
		}
		return;
	}
	// --- End Positron ---

	return baseActivate({
		context,
		registerServices,
		contributions: vscodeNodeContributions,
		configureDevPackages,
		forceActivation
	});
}
