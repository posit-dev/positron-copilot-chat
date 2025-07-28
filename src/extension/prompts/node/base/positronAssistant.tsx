/*---------------------------------------------------------------------------------------------
 *  Copyright (C) 2025 Posit Software, PBC. All rights reserved.
 *  Licensed under the Elastic License 2.0. See LICENSE.txt for license information.
 *--------------------------------------------------------------------------------------------*/

import { PromptElement, PromptPiece, PromptSizing } from '@vscode/prompt-tsx';
import { ChatResponsePart } from '@vscode/prompt-tsx/dist/base/vscodeTypes';
import * as vscode from 'vscode';
import { CancellationToken, Progress } from 'vscode';
import { GenericBasePromptElementProps } from '../../../context/node/resolvers/genericPanelIntentInvocation';

export class PositronAssistant extends PromptElement<GenericBasePromptElementProps> {
	private ele: PromptElement;
	constructor(props: GenericBasePromptElementProps) {
		super(props);
		const api = vscode.extensions.getExtension('positron.positron-assistant')?.exports;
		this.ele = api.generateAssistantPrompt(props.promptContext);
	}

	override async prepare(_sizing: PromptSizing,
		_progress?: Progress<ChatResponsePart>,
		_token?: CancellationToken): Promise<void> {
		if (this.ele.prepare) {
			await this.ele.prepare(_sizing, _progress, _token);
		}
	}

	render(state: void, sizing: PromptSizing): PromptPiece {
		return this.ele.render(state, sizing) ?? <br />;
	}
}
