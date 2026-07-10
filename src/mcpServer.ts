import * as cp from 'child_process'
import * as vscode from 'vscode'

/**
 * Manages the SigRank MCP server as a child process.
 * When running, AI clients (Copilot, Claude Code, etc.) can call sigrank tools
 * directly from within VS Code.
 */
export class McpServerManager {
  private proc?: cp.ChildProcess
  private outputChannel: vscode.OutputChannel

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('SigRank MCP Server')
  }

  get isRunning(): boolean {
    return this.proc !== undefined && !this.proc.killed
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      vscode.window.showInformationMessage('SigRank MCP server is already running.')
      return
    }

    this.outputChannel.show(true)
    this.outputChannel.appendLine('[sigrank-mcp] Starting MCP server (stdio mode)...')

    this.proc = cp.spawn('npx', ['--yes', 'sigrank-mcp'], {
      cwd: vscode.workspace.rootPath || process.env.HOME,
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    this.proc.stdout?.on('data', (d) => {
      this.outputChannel.appendLine(`[stdout] ${d}`)
    })

    this.proc.stderr?.on('data', (d) => {
      this.outputChannel.appendLine(`[stderr] ${d}`)
    })

    this.proc.on('error', (err) => {
      this.outputChannel.appendLine(`[error] ${err.message}`)
      vscode.window.showErrorMessage(`SigRank MCP server failed: ${err.message}`)
      this.proc = undefined
    })

    this.proc.on('close', (code) => {
      this.outputChannel.appendLine(`[sigrank-mcp] Server exited (code ${code})`)
      this.proc = undefined
    })

    // Give it a moment to start
    await new Promise((r) => setTimeout(r, 1000))

    if (this.isRunning) {
      vscode.window.showInformationMessage('SigRank MCP server started. AI clients can now call sigrank tools.')
    }
  }

  async stop(): Promise<void> {
    if (!this.proc) {
      vscode.window.showInformationMessage('SigRank MCP server is not running.')
      return
    }

    this.proc.kill('SIGTERM')
    await new Promise((r) => setTimeout(r, 500))
    if (this.proc && !this.proc.killed) {
      this.proc.kill('SIGKILL')
    }
    this.proc = undefined
    this.outputChannel.appendLine('[sigrank-mcp] Server stopped.')
    vscode.window.showInformationMessage('SigRank MCP server stopped.')
  }

  dispose() {
    if (this.proc) {
      this.proc.kill('SIGTERM')
      this.proc = undefined
    }
    this.outputChannel.dispose()
  }
}
