/*---------------------------------------------------------------------------------------------
 *  Copyright (C) 2025 Posit Software, PBC. All rights reserved.
 *  Licensed under the Elastic License 2.0. See LICENSE.txt for license information.
 *--------------------------------------------------------------------------------------------*/

import { AssistantMessage, PromptElement, PromptSizing } from '@vscode/prompt-tsx';
import * as vscode from 'vscode';
import { GenericBasePromptElementProps } from '../../../context/node/resolvers/genericPanelIntentInvocation';

/**
 * The Positron Assistant component; adds context from Positron as a prompt
 * element for embedding in Copilot Chat's prompt-tsx prompts
 */
export class PositronAssistant extends PromptElement<GenericBasePromptElementProps, any> {
	private content: string;

	constructor(props: GenericBasePromptElementProps) {
		super(props);
		// Get the Positron API
		const api = vscode.extensions.getExtension('positron.positron-assistant')?.exports;

		// Generate the content element
		this.content = api.generateAssistantPrompt(props.promptContext.request);
	}

	/**
	 * Renders the component.
	 * @param state The current state of the component.
	 * @param sizing The sizing information for the component.
	 *
	 * @returns The rendered component.
	 */
	render(state: any, sizing: PromptSizing) {
		return (
			<AssistantMessage>
				{this.content}
			</AssistantMessage>
		);
	}
}
