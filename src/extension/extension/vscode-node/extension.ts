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

	// TODO: Don't activate until we have an auth session
	// --- End Positron ---

	return baseActivate({
		context,
		registerServices,
		contributions: vscodeNodeContributions,
		configureDevPackages,
		forceActivation
	});
}
