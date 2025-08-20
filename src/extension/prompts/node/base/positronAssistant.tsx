/*---------------------------------------------------------------------------------------------
 *  Copyright (C) 2025 Posit Software, PBC. All rights reserved.
 *  Licensed under the Elastic License 2.0. See LICENSE.txt for license information.
 *--------------------------------------------------------------------------------------------*/

import { AssistantMessage, PromptElement, PromptSizing } from '@vscode/prompt-tsx';
import { ChatResponsePart } from '@vscode/prompt-tsx/dist/base/vscodeTypes';
import * as vscode from 'vscode';
import { CancellationToken, Progress } from 'vscode';
import { GenericBasePromptElementProps } from '../../../context/node/resolvers/genericPanelIntentInvocation';

/**
 * The Positron Assistant component; adds context from Positron as a prompt
 * element for embedding in Copilot Chat's prompt-tsx prompts
 */
export class PositronAssistant extends PromptElement<GenericBasePromptElementProps, any> {
	private contentElement: PromptElement;

	constructor(props: GenericBasePromptElementProps) {
		super(props);
		// Get the Positron API
		const api = vscode.extensions.getExtension('positron.positron-assistant')?.exports;

		// Generate the content element
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
