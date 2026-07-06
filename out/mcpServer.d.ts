/**
 * Manages the SigRank MCP server as a child process.
 * When running, AI clients (Copilot, Claude Code, etc.) can call sigrank tools
 * directly from within VS Code.
 */
export declare class McpServerManager {
    private proc?;
    private outputChannel;
    constructor();
    get isRunning(): boolean;
    start(): Promise<void>;
    stop(): Promise<void>;
    dispose(): void;
}
