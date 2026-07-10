import * as cp from 'child_process'
import * as vscode from 'vscode'
import type { TokenPullResult, LeaderboardEntry, OperatorProfile, CascadeMetrics } from './types'

/**
 * Talks to the sigrank CLI (`npx sigrank`) under the hood.
 * In a TTY context sigrank launches its TUI; in a piped/non-TTY context it
 * starts an MCP stdio server. We use the CLI shortcuts (enroll / submit / board)
 * and the MCP tool `tokenpull` for local reads.
 */
export class SigrankClient {
  private apiBaseUrl: string

  constructor() {
    this.apiBaseUrl = vscode.workspace.getConfiguration('sigrank').get('apiBaseUrl', 'https://signalaf.com')
  }

  /** Run `npx sigrank <args>` and capture JSON stdout. */
  private runCli(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = cp.spawn('npx', ['--yes', 'sigrank', ...args], {
        cwd: vscode.workspace.rootPath || process.env.HOME,
        env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
        stdio: ['pipe', 'pipe', 'pipe'],
      })

      let stdout = ''
      let stderr = ''

      proc.stdout.on('data', (d) => { stdout += d.toString() })
      proc.stderr.on('data', (d) => { stderr += d.toString() })

      proc.on('error', (err) => {
        reject(new Error(`Failed to run sigrank: ${err.message}`))
      })

      proc.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`sigrank exited ${code}: ${stderr.slice(0, 500)}`))
        } else {
          resolve(stdout)
        }
      })
    })
  }

  /** Fetch the live leaderboard from the API. */
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const url = `${this.apiBaseUrl}/api/leaderboard`
      const resp = await fetch(url)
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const data: any = await resp.json()
      if (Array.isArray(data)) return data as LeaderboardEntry[]
      if (data.operators && Array.isArray(data.operators)) return data.operators as LeaderboardEntry[]
      return []
    } catch (err: unknown) {
      console.error('[sigrank] Failed to fetch leaderboard from API:', err instanceof Error ? err.message : err)
      // Fallback: try CLI
      const out = await this.runCli(['board', '--json'])
      return this.parseJson(out, [])
    }
  }

  /** Pull local token usage via the MCP tokenpull tool (runs CLI in non-TTY mode). */
  async tokenPull(platform?: string): Promise<TokenPullResult> {
    // The CLI in non-TTY mode starts the MCP server. We call the tokenpull tool
    // by sending a JSON-RPC request over stdin.
    const args = platform ? ['--platform', platform] : []
    const out = await this.runCli(['pull', ...args])
    return this.parseJson(out, { windows: [], platform: platform || 'claude' })
  }

  /** Rank a paste of token counts (no network). */
  async rankPaste(text: string): Promise<CascadeMetrics> {
    const out = await this.runCli(['rank', text])
    return this.parseJson(out, {} as CascadeMetrics)
  }

  /** Submit a signed snapshot to the board. */
  async submit(): Promise<{ ok: boolean; message: string }> {
    const out = await this.runCli(['submit', '--json'])
    return this.parseJson(out, { ok: false, message: 'unknown' })
  }

  /** Dry run — inspect the payload without sending. */
  async dryRun(): Promise<string> {
    const out = await this.runCli(['submit', '--dry-run'])
    return out
  }

  /** Enroll (sign in via connect code). */
  async enroll(connectCode: string): Promise<{ ok: boolean; codename?: string; message: string }> {
    const out = await this.runCli(['enroll', connectCode, '--json'])
    return this.parseJson(out, { ok: false, message: 'unknown' })
  }

  /** Get operator profile by codename. */
  async getOperator(codename: string): Promise<OperatorProfile | null> {
    try {
      const url = `${this.apiBaseUrl}/api/operator/${encodeURIComponent(codename)}`
      const resp = await fetch(url)
      if (!resp.ok) return null
      return await resp.json() as OperatorProfile
    } catch (err: unknown) {
      console.error('[sigrank] Failed to fetch operator profile:', err instanceof Error ? err.message : err)
      return null
    }
  }

  private parseJson<T>(raw: string, fallback: T): T {
    try {
      // The CLI may print non-JSON lines before the JSON; find the first { or [
      const trimmed = raw.trim()
      const jsonStart = trimmed.search(/[{[]/)
      if (jsonStart === -1) return fallback
      const jsonStr = trimmed.slice(jsonStart)
      return JSON.parse(jsonStr) as T
    } catch (err: unknown) {
      console.error('[sigrank] Failed to parse CLI output:', err instanceof Error ? err.message : err)
      return fallback
    }
  }
}
