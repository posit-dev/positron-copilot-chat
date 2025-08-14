/*---------------------------------------------------------------------------------------------
 *  Copyright (C) 2025 Posit Software, PBC. All rights reserved.
 *  Licensed under the Elastic License 2.0. See LICENSE.txt for license information.
 *--------------------------------------------------------------------------------------------*/

import { AssistantMessage, PromptElement, PromptSizing } from '@vscode/prompt-tsx';
import { ChatResponsePart } from '@vscode/prompt-tsx/dist/base/vscodeTypes';
import * as vscode from 'vscode';
import { CancellationToken, Progress } from 'vscode';
import { GenericBasePromptElementProps } from '../../../context/node/resolvers/genericPanelIntentInvocation';

export class PositronAssistant extends PromptElement<GenericBasePromptElementProps, any> {
	private contentElement: PromptElement;
	
	constructor(props: GenericBasePromptElementProps) {
		super(props);
		const api = vscode.extensions.getExtension('positron.positron-assistant')?.exports;
		console.log('*** Generating Positron Assistant tag');
		this.contentElement = api.generateAssistantPrompt(props.promptContext.request);
	}

	override async prepare(sizing: PromptSizing,
		progress?: Progress<ChatResponsePart>,
		token?: CancellationToken): Promise<any> {
		if (this.contentElement.prepare) {
			const result = await this.contentElement.prepare(sizing, progress, token);
			return result;
		}
	}

	render(state: any, sizing: PromptSizing) {
		// Wrap the content from the assistant extension in our own AssistantMessage
		// to ensure proper chat message context across extension boundaries
		const content = this.contentElement.render(state, sizing);
		return (
			<AssistantMessage>
				{content}
			</AssistantMessage>
		);
	}
}
