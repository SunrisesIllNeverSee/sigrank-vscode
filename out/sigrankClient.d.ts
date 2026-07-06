import type { TokenPullResult, LeaderboardEntry, OperatorProfile, CascadeMetrics } from './types';
/**
 * Talks to the sigrank CLI (`npx sigrank`) under the hood.
 * In a TTY context sigrank launches its TUI; in a piped/non-TTY context it
 * starts an MCP stdio server. We use the CLI shortcuts (enroll / submit / board)
 * and the MCP tool `tokenpull` for local reads.
 */
export declare class SigrankClient {
    private apiBaseUrl;
    constructor();
    /** Run `npx sigrank <args>` and capture JSON stdout. */
    private runCli;
    /** Fetch the live leaderboard from the API. */
    getLeaderboard(): Promise<LeaderboardEntry[]>;
    /** Pull local token usage via the MCP tokenpull tool (runs CLI in non-TTY mode). */
    tokenPull(platform?: string): Promise<TokenPullResult>;
    /** Rank a paste of token counts (no network). */
    rankPaste(text: string): Promise<CascadeMetrics>;
    /** Submit a signed snapshot to the board. */
    submit(): Promise<{
        ok: boolean;
        message: string;
    }>;
    /** Dry run — inspect the payload without sending. */
    dryRun(): Promise<string>;
    /** Enroll (sign in via connect code). */
    enroll(connectCode: string): Promise<{
        ok: boolean;
        codename?: string;
        message: string;
    }>;
    /** Get operator profile by codename. */
    getOperator(codename: string): Promise<OperatorProfile | null>;
    private parseJson;
}
