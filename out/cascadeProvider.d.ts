import * as vscode from 'vscode';
import type { TokenPullResult } from './types';
export declare class CascadeProvider implements vscode.WebviewViewProvider {
    private readonly context;
    static readonly viewType = "sigrank.cascadeView";
    private view?;
    private onRefresh?;
    constructor(context: vscode.ExtensionContext);
    setRefreshCallback(cb: () => void): void;
    resolveWebviewView(view: vscode.WebviewView): void;
    update(data: TokenPullResult | null): void;
    setError(msg: string): void;
    private getHtml;
}
