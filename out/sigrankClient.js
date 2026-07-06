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
exports.SigrankClient = void 0;
const cp = __importStar(require("child_process"));
const vscode = __importStar(require("vscode"));
/**
 * Talks to the sigrank CLI (`npx sigrank`) under the hood.
 * In a TTY context sigrank launches its TUI; in a piped/non-TTY context it
 * starts an MCP stdio server. We use the CLI shortcuts (enroll / submit / board)
 * and the MCP tool `tokenpull` for local reads.
 */
class SigrankClient {
    apiBaseUrl;
    constructor() {
        this.apiBaseUrl = vscode.workspace.getConfiguration('sigrank').get('apiBaseUrl', 'https://signalaf.com');
    }
    /** Run `npx sigrank <args>` and capture JSON stdout. */
    runCli(args) {
        return new Promise((resolve, reject) => {
            const proc = cp.spawn('npx', ['--yes', 'sigrank', ...args], {
                cwd: vscode.workspace.rootPath || process.env.HOME,
                env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            let stdout = '';
            let stderr = '';
            proc.stdout.on('data', (d) => { stdout += d.toString(); });
            proc.stderr.on('data', (d) => { stderr += d.toString(); });
            proc.on('error', (err) => {
                reject(new Error(`Failed to run sigrank: ${err.message}`));
            });
            proc.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`sigrank exited ${code}: ${stderr.slice(0, 500)}`));
                }
                else {
                    resolve(stdout);
                }
            });
        });
    }
    /** Fetch the live leaderboard from the API. */
    async getLeaderboard() {
        try {
            const url = `${this.apiBaseUrl}/api/leaderboard`;
            const resp = await fetch(url);
            if (!resp.ok)
                throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            if (Array.isArray(data))
                return data;
            if (data.operators && Array.isArray(data.operators))
                return data.operators;
            return [];
        }
        catch {
            // Fallback: try CLI
            const out = await this.runCli(['board', '--json']);
            return this.parseJson(out, []);
        }
    }
    /** Pull local token usage via the MCP tokenpull tool (runs CLI in non-TTY mode). */
    async tokenPull(platform) {
        // The CLI in non-TTY mode starts the MCP server. We call the tokenpull tool
        // by sending a JSON-RPC request over stdin.
        const args = platform ? ['--platform', platform] : [];
        const out = await this.runCli(['pull', ...args]);
        return this.parseJson(out, { windows: [], platform: platform || 'claude' });
    }
    /** Rank a paste of token counts (no network). */
    async rankPaste(text) {
        const out = await this.runCli(['rank', text]);
        return this.parseJson(out, {});
    }
    /** Submit a signed snapshot to the board. */
    async submit() {
        const out = await this.runCli(['submit', '--json']);
        return this.parseJson(out, { ok: false, message: 'unknown' });
    }
    /** Dry run — inspect the payload without sending. */
    async dryRun() {
        const out = await this.runCli(['submit', '--dry-run']);
        return out;
    }
    /** Enroll (sign in via connect code). */
    async enroll(connectCode) {
        const out = await this.runCli(['enroll', connectCode, '--json']);
        return this.parseJson(out, { ok: false, message: 'unknown' });
    }
    /** Get operator profile by codename. */
    async getOperator(codename) {
        try {
            const url = `${this.apiBaseUrl}/api/operator/${encodeURIComponent(codename)}`;
            const resp = await fetch(url);
            if (!resp.ok)
                return null;
            return await resp.json();
        }
        catch {
            return null;
        }
    }
    parseJson(raw, fallback) {
        try {
            // The CLI may print non-JSON lines before the JSON; find the first { or [
            const trimmed = raw.trim();
            const jsonStart = trimmed.search(/[{[]/);
            if (jsonStart === -1)
                return fallback;
            const jsonStr = trimmed.slice(jsonStart);
            return JSON.parse(jsonStr);
        }
        catch {
            return fallback;
        }
    }
}
exports.SigrankClient = SigrankClient;
//# sourceMappingURL=sigrankClient.js.map