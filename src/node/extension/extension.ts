/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

'use strict';

import * as vscode from 'vscode';

import { NodeConfigurationProvider, startDebuggingAndStopOnEntry } from './configurationProvider';
import { pickProcess, attachProcess } from './processPicker';
import { Cluster } from './cluster';
import { initializeAutoAttach } from './autoAttach';

export function activate(context: vscode.ExtensionContext) {

	// register a configuration provider
	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('v8jsidbg', new NodeConfigurationProvider(context)));

	// auto attach
	initializeAutoAttach(context);

	// toggle skipping file action
	context.subscriptions.push(vscode.commands.registerCommand('extension.v8jsi-debug.toggleSkippingFile', toggleSkippingFile));

	// process picker command
	context.subscriptions.push(vscode.commands.registerCommand('extension.pickNodeProcess', pickProcess));

	// attach process command
	context.subscriptions.push(vscode.commands.registerCommand('extension.v8jsi-debug.attachNodeProcess', attachProcess));

	// F10 and F11 should start debugging with stopOnEntry:true
	context.subscriptions.push(vscode.commands.registerCommand('extension.v8jsi-debug.startWithStopOnEntry', startDebuggingAndStopOnEntry));

	// cluster
	context.subscriptions.push(vscode.debug.onDidStartDebugSession(session => Cluster.startSession(session)));
	context.subscriptions.push(vscode.debug.onDidTerminateDebugSession(session => Cluster.stopSession(session)));
}

export function deactivate() {
}


//---- toggle skipped files

function toggleSkippingFile(res: string | number): void {

	let resource: string | number | undefined = res;

	if (!resource) {
		const activeEditor = vscode.window.activeTextEditor;
		resource = activeEditor && activeEditor.document.fileName;
	}

	if (resource && vscode.debug.activeDebugSession) {
		const args = typeof resource === 'string' ? { resource } : { sourceReference: resource };
		vscode.debug.activeDebugSession.customRequest('toggleSkipFileStatus', args);
	}
}
