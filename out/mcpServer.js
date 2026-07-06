"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpServerManager = void 0;
const cp = __importStar(require("child_process"));
const vscode = __importStar(require("vscode"));
/**
 * Manages the SigRank MCP server as a child process.
 * When running, AI clients (Copilot, Claude Code, etc.) can call sigrank tools
 * directly from within VS Code.
 */
class McpServerManager {
    proc;
    outputChannel;
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('SigRank MCP Server');
    }
    get isRunning() {
        return this.proc !== undefined && !this.proc.killed;
    }
    async start() {
        if (this.isRunning) {
            vscode.window.showInformationMessage('SigRank MCP server is already running.');
            return;
        }
        this.outputChannel.show(true);
        this.outputChannel.appendLine('[sigrank-mcp] Starting MCP server (stdio mode)...');
        this.proc = cp.spawn('npx', ['--yes', 'sigrank-mcp'], {
            cwd: vscode.workspace.rootPath || process.env.HOME,
            env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        this.proc.stdout?.on('data', (d) => {
            this.outputChannel.append(`[stdout] ${d}`);
        });
        this.proc.stderr?.on('data', (d) => {
            this.outputChannel.append(`[stderr] ${d}`);
        });
        this.proc.on('error', (err) => {
            this.outputChannel.appendLine(`[error] ${err.message}`);
            vscode.window.showErrorMessage(`SigRank MCP server failed: ${err.message}`);
            this.proc = undefined;
        });
        this.proc.on('close', (code) => {
            this.outputChannel.appendLine(`[sigrank-mcp] Server exited (code ${code})`);
            this.proc = undefined;
        });
        // Give it a moment to start
        await new Promise((r) => setTimeout(r, 1000));
        if (this.isRunning) {
            vscode.window.showInformationMessage('SigRank MCP server started. AI clients can now call sigrank tools.');
        }
    }
    async stop() {
        if (!this.proc) {
            vscode.window.showInformationMessage('SigRank MCP server is not running.');
            return;
        }
        this.proc.kill('SIGTERM');
        await new Promise((r) => setTimeout(r, 500));
        if (this.proc && !this.proc.killed) {
            this.proc.kill('SIGKILL');
        }
        this.proc = undefined;
        this.outputChannel.appendLine('[sigrank-mcp] Server stopped.');
        vscode.window.showInformationMessage('SigRank MCP server stopped.');
    }
    dispose() {
        if (this.proc) {
            this.proc.kill('SIGTERM');
            this.proc = undefined;
        }
        this.outputChannel.dispose();
    }
}
exports.McpServerManager = McpServerManager;
//# sourceMappingURL=mcpServer.js.map