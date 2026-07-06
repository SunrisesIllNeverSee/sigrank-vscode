import * as vscode from 'vscode';
import type { LeaderboardEntry } from './types';
export declare class LeaderboardProvider implements vscode.WebviewViewProvider {
    private readonly context;
    static readonly viewType = "sigrank.leaderboardView";
    private view?;
    private onRefresh?;
    constructor(context: vscode.ExtensionContext);
    setRefreshCallback(cb: () => void): void;
    resolveWebviewView(view: vscode.WebviewView): void;
    update(entries: LeaderboardEntry[]): void;
    setError(msg: string): void;
    private getHtml;
}
