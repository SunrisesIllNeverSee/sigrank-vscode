import * as vscode from 'vscode'
import { SigrankClient } from './sigrankClient'
import { StatusBar } from './statusBar'
import { CascadeProvider } from './cascadeProvider'
import { LeaderboardProvider } from './leaderboardProvider'
import { McpServerManager } from './mcpServer'
import type { TokenPullResult, LeaderboardEntry, CascadeMetrics } from './types'

let client: SigrankClient
let statusBar: StatusBar
let cascadeProvider: CascadeProvider
let leaderboardProvider: LeaderboardProvider
let mcpServer: McpServerManager

export function activate(context: vscode.ExtensionContext) {
  client = new SigrankClient()
  statusBar = new StatusBar()
  cascadeProvider = new CascadeProvider(context)
  leaderboardProvider = new LeaderboardProvider(context)
  mcpServer = new McpServerManager()

  // Register webview providers
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(CascadeProvider.viewType, cascadeProvider),
  )
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(LeaderboardProvider.viewType, leaderboardProvider),
  )

  // Set refresh callbacks
  cascadeProvider.setRefreshCallback(() => refreshCascade())
  leaderboardProvider.setRefreshCallback(() => refreshLeaderboard())

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('sigrank.refresh', refreshAll),
    vscode.commands.registerCommand('sigrank.openDashboard', openDashboard),
    vscode.commands.registerCommand('sigrank.openLeaderboard', openLeaderboard),
    vscode.commands.registerCommand('sigrank.submitSnapshot', submitSnapshot),
    vscode.commands.registerCommand('sigrank.dryRun', dryRun),
    vscode.commands.registerCommand('sigrank.startMcpServer', () => mcpServer.start()),
    vscode.commands.registerCommand('sigrank.stopMcpServer', () => mcpServer.stop()),
  )

  // Auto-refresh
  const config = vscode.workspace.getConfiguration('sigrank')
  if (config.get('autoRefresh', true)) {
    const interval = config.get('refreshIntervalSeconds', 300)
    statusBar.startAutoRefresh(interval, refreshAll)
  }

  // Auto-start MCP server
  if (config.get('mcpServerEnabled', false)) {
    mcpServer.start()
  }

  // Initial refresh
  refreshAll()

  // Refresh on config change
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('sigrank')) {
        client = new SigrankClient()
        const cfg = vscode.workspace.getConfiguration('sigrank')
        statusBar.stopAutoRefresh()
        if (cfg.get('autoRefresh', true)) {
          statusBar.startAutoRefresh(cfg.get('refreshIntervalSeconds', 300), refreshAll)
        }
      }
    }),
  )
}

export function deactivate() {
  statusBar.dispose()
  mcpServer.dispose()
}

// ─── Actions ──────────────────────────────────────────────────────────────────

async function refreshAll() {
  await Promise.all([refreshCascade(), refreshLeaderboard()])
}

async function refreshCascade() {
  statusBar.setLoading()
  try {
    const data = await client.tokenPull()
    if (data.windows.length > 0) {
      const latest = data.windows[0]
      statusBar.update(latest.cascade)
      cascadeProvider.update(data)
    } else {
      statusBar.update(null)
      cascadeProvider.update(null)
    }
  } catch (err: any) {
    statusBar.setError(err.message)
    cascadeProvider.setError(err.message)
  }
}

async function refreshLeaderboard() {
  try {
    const entries = await client.getLeaderboard()
    leaderboardProvider.update(entries)
  } catch (err: any) {
    leaderboardProvider.setError(err.message)
  }
}

function openDashboard() {
  vscode.commands.executeCommand('sigrank.cascadeView.focus')
}

function openLeaderboard() {
  vscode.commands.executeCommand('sigrank.leaderboardView.focus')
}

async function submitSnapshot() {
  const action = await vscode.window.showInformationMessage(
    'Submit your signed token snapshot to the SigRank board?',
    'Submit',
    'Dry run first',
    'Cancel',
  )
  if (action === 'Cancel' || !action) return

  if (action === 'Dry run first') {
    await dryRun()
    const proceed = await vscode.window.showInformationMessage(
      'Dry run complete — check the output. Proceed with submit?',
      'Submit',
      'Cancel',
    )
    if (proceed !== 'Submit') return
  }

  try {
    statusBar.setLoading()
    const result = await client.submit()
    if (result.ok) {
      vscode.window.showInformationMessage(`SigRank: ${result.message}`)
      await refreshAll()
    } else {
      vscode.window.showWarningMessage(`SigRank: ${result.message}`)
    }
  } catch (err: any) {
    vscode.window.showErrorMessage(`SigRank submit failed: ${err.message}`)
  }
}

async function dryRun() {
  try {
    const output = await client.dryRun()
    const channel = vscode.window.createOutputChannel('SigRank Dry Run')
    channel.show(true)
    channel.appendLine('=== SigRank submit --dry-run ===')
    channel.append(output)
    channel.appendLine('\n=== End — nothing was sent ===')
  } catch (err: any) {
    vscode.window.showErrorMessage(`SigRank dry run failed: ${err.message}`)
  }
}
