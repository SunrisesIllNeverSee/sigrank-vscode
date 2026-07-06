import * as vscode from 'vscode'
import type { TokenPullResult, CascadeMetrics } from './types'

export class CascadeProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'sigrank.cascadeView'
  private view?: vscode.WebviewView
  private onRefresh?: () => void

  constructor(private readonly context: vscode.ExtensionContext) {}

  setRefreshCallback(cb: () => void) {
    this.onRefresh = cb
  }

  resolveWebviewView(view: vscode.WebviewView) {
    this.view = view
    view.webview.options = {
      enableScripts: true,
      localResourceRoots: [],
    }
    view.webview.html = this.getHtml(null)
    view.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === 'refresh' && this.onRefresh) {
        this.onRefresh()
      } else if (msg.type === 'submit') {
        vscode.commands.executeCommand('sigrank.submitSnapshot')
      } else if (msg.type === 'dryRun') {
        vscode.commands.executeCommand('sigrank.dryRun')
      }
    })
  }

  update(data: TokenPullResult | null) {
    if (this.view) {
      this.view.webview.html = this.getHtml(data)
    }
  }

  setError(msg: string) {
    if (this.view) {
      this.view.webview.html = this.getHtml(null, msg)
    }
  }

  private getHtml(data: TokenPullResult | null, error?: string): string {
    const windows = data?.windows || []
    const hasData = windows.length > 0

    const windowCards = windows.map((w) => {
      const c = w.cascade
      const p = w.pillars
      return `
        <div class="window-card">
          <div class="window-label">${w.window}</div>
          <div class="metrics-grid">
            <div class="metric headline">
              <span class="metric-label">Υ Yield</span>
              <span class="metric-value">${fmtNum(c.yield_)}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Leverage</span>
              <span class="metric-value">${fmtNum(c.leverage)}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Velocity</span>
              <span class="metric-value">${fmtNum(c.velocity)}</span>
            </div>
            <div class="metric">
              <span class="metric-label">SNR</span>
              <span class="metric-value">${fmtNum(c.snr)}</span>
            </div>
            <div class="metric">
              <span class="metric-label">10xDEV</span>
              <span class="metric-value">${c.tenx_dev !== null ? fmtNum(c.tenx_dev) : '—'}</span>
            </div>
            <div class="metric class-badge class-${c.class.toLowerCase().replace(/[^a-z0-9]/g, '')}">
              <span class="metric-label">Class</span>
              <span class="metric-value">${c.class}</span>
            </div>
          </div>
          <div class="pillars">
            <span title="Input">IN ${fmtInt(p.input)}</span>
            <span title="Output">OUT ${fmtInt(p.output)}</span>
            <span title="Cache-write">CW ${fmtInt(p.cacheCreate)}</span>
            <span title="Cache-read">CR ${fmtInt(p.cacheRead)}</span>
          </div>
          ${w.estimated ? '<div class="badge estimated">estimated</div>' : ''}
          ${w.dataGap ? `<div class="badge datagap">${w.dataGap}</div>` : ''}
          ${c.warnings.length > 0 ? `<div class="warnings">${c.warnings.map((w) => `<div>⚠ ${w}</div>`).join('')}</div>` : ''}
        </div>
      `
    }).join('')

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body {
    font-family: var(--vscode-font-family, -apple-system, sans-serif);
    font-size: var(--vscode-font-size, 13px);
    color: var(--vscode-foreground);
    background: var(--vscode-editor-background);
    padding: 12px;
    margin: 0;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .platform {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .actions {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  .btn {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    padding: 4px 10px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px;
  }
  .btn:hover {
    background: var(--vscode-button-hoverBackground);
  }
  .btn.secondary {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
  }
  .window-card {
    background: var(--vscode-editor-inactive-selectionBackground, rgba(255,255,255,0.03));
    border: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 10px;
  }
  .window-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-descriptionForeground);
    margin-bottom: 8px;
  }
  .metrics-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 6px;
    margin-bottom: 8px;
  }
  .metric {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .metric.headline {
    grid-column: span 3;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.06));
    margin-bottom: 4px;
  }
  .metric-label {
    font-size: 10px;
    color: var(--vscode-descriptionForeground);
  }
  .metric-value {
    font-size: 14px;
    font-weight: 600;
    font-family: var(--vscode-editor-font-family, monospace);
  }
  .metric.headline .metric-value {
    font-size: 20px;
    color: var(--vscode-textLink-foreground, #4daafc);
  }
  .class-badge .metric-value {
    color: var(--vscode-textLink-foreground, #4daafc);
  }
  .pillars {
    display: flex;
    gap: 12px;
    font-size: 10px;
    font-family: var(--vscode-editor-font-family, monospace);
    color: var(--vscode-descriptionForeground);
    padding-top: 6px;
    border-top: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.06));
  }
  .badge {
    display: inline-block;
    font-size: 9px;
    padding: 1px 6px;
    border-radius: 3px;
    margin-top: 4px;
  }
  .badge.estimated {
    background: rgba(255, 180, 0, 0.15);
    color: #e8a838;
  }
  .badge.datagap {
    background: rgba(255, 100, 100, 0.15);
    color: #e85a5a;
  }
  .warnings {
    margin-top: 6px;
    font-size: 10px;
    color: #e8a838;
  }
  .empty {
    text-align: center;
    padding: 40px 20px;
    color: var(--vscode-descriptionForeground);
  }
  .empty-icon {
    font-size: 32px;
    margin-bottom: 8px;
    opacity: 0.4;
  }
  .error {
    color: var(--vscode-errorForeground, #e85a5a);
    padding: 12px;
    font-size: 12px;
  }
  .card-text {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    font-style: italic;
    margin-top: 8px;
    padding: 6px 8px;
    background: var(--vscode-textBlockQuote-background, rgba(255,255,255,0.02));
    border-radius: 4px;
  }
</style>
</head>
<body>
  <div class="header">
    <span class="platform">${data?.platform || 'claude'}</span>
    <button class="btn secondary" onclick="send('refresh')">↻ Refresh</button>
  </div>
  ${error ? `<div class="error">${error}</div>` : ''}
  ${!error && !hasData ? `
    <div class="empty">
      <div class="empty-icon">◈</div>
      <div>No token data yet.</div>
      <div style="margin-top:4px;font-size:11px;">Click refresh to pull your local tokens.</div>
    </div>
  ` : ''}
  ${hasData ? windowCards : ''}
  ${hasData && windows[0]?.cascade?.card ? `<div class="card-text">${windows[0].cascade.card}</div>` : ''}
  ${hasData ? `
    <div class="actions">
      <button class="btn" onclick="send('submit')">Submit to board</button>
      <button class="btn secondary" onclick="send('dryRun')">Dry run</button>
    </div>
  ` : ''}
  <script>
    const vscode = acquireVsCodeApi();
    function send(type) { vscode.postMessage({ type }); }
  </script>
</body>
</html>`

    function fmtNum(n: number): string {
      if (n >= 100) return n.toFixed(0)
      if (n >= 10) return n.toFixed(1)
      if (n >= 1) return n.toFixed(2)
      return n.toFixed(3)
    }
    function fmtInt(n: number): string {
      if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
      if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
      return n.toString()
    }
  }
}
