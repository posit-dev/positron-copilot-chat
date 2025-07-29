/*---------------------------------------------------------------------------------------------
 *  Copyright (C) 2025 Posit Software, PBC. All rights reserved.
 *  Licensed under the Elastic License 2.0. See LICENSE.txt for license information.
 *--------------------------------------------------------------------------------------------*/

import { PromptElement, PromptPiece, PromptSizing } from '@vscode/prompt-tsx';
import { ChatResponsePart } from '@vscode/prompt-tsx/dist/base/vscodeTypes';
import * as vscode from 'vscode';
import { CancellationToken, Progress } from 'vscode';
import { GenericBasePromptElementProps } from '../../../context/node/resolvers/genericPanelIntentInvocation';

export class PositronAssistant extends PromptElement<GenericBasePromptElementProps, any> {
	private ele: PromptElement;
	constructor(props: GenericBasePromptElementProps) {
		super(props);
		const api = vscode.extensions.getExtension('positron.positron-assistant')?.exports;
		console.log('*** Generating Positron Assistant tag');
		this.ele = api.generateAssistantPrompt(props.promptContext.request);
	}

	override async prepare(sizing: PromptSizing,
		progress?: Progress<ChatResponsePart>,
		token?: CancellationToken): Promise<any> {
		if (this.ele.prepare) {
			const result = await this.ele.prepare(sizing, progress, token);
			return result;
		}
	}

	render(state: any, sizing: PromptSizing): PromptPiece {
		return this.ele.render(state, sizing) as PromptPiece;
	}
}
