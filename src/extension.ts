import * as vscode from 'vscode';
import { jsonpathpy } from './jsonpathpy';

let currentString: string = '';
let cn: string = '';
let status: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    status.command = 'extension.jsonpathPY';
    status.show();
    context.subscriptions.push(status); 
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(e => updateStatus(status)));
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(e => updateStatus(status)));
    context.subscriptions.push(vscode.window.onDidChangeTextEditorViewColumn(e => updateStatus(status)));
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(e => updateStatus(status)));
    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(e => updateStatus(status)));
    context.subscriptions.push(vscode.commands.registerCommand('New Path', async () => {await vscode.env.clipboard.writeText(cn);}));
    context.subscriptions.push(vscode.commands.registerCommand('extension.jsonpathPY', async () => {
        await vscode.env.clipboard.writeText(currentString);
    }));
    updateStatus(status);
}

function updateStatus(status: vscode.StatusBarItem): void {
    
    currentString = '';
    
    const editor = vscode.window.activeTextEditor
    if (!editor || !(
        editor.document.languageId.toLowerCase() === 'json' ||
        editor.document.languageId.toLowerCase() === 'jsonc' ||
        editor.document.languageId.toLowerCase() === 'asl' ||
        editor.document.languageId.toLowerCase() === 'ssm-json')) {
            status.text = '';
            return;
        }
        
        try {
            const text = editor.document.getText();
            const path = jsonpathpy(text, editor.document.offsetAt(editor.selection.active));
            currentString = path;
            
            
            status.text = 'JSONPath: ' + path;
            status.tooltip = 'Click to copy to clipboard';
        } catch (iserror) {
            if (iserror instanceof SyntaxError) {
                status.text = `JSONPath: Invalid JSON.`;
            } else {
                status.text = `JSONPath: Error.`;
            }
            status.tooltip = undefined;
        }
    }

export function deactivate() {
}
