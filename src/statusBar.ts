import * as vscode from 'vscode'
import type { CascadeMetrics } from './types'

const CLASS_GLYPHS: Record<string, string> = {
  TRANSMITTER: '◈',
  'ARCH+': '▲',
  ARCH: '▽',
  POWER: '⬡',
  BASE: '↓',
  SEEKER: '◎',
  REFINER: '⟳',
  BEARER: '◇',
  IGNITER: '·',
  Burner: '🔥',
  Builder: '⚒',
  '10xer': '★',
}

export class StatusBar {
  private item: vscode.StatusBarItem
  private refreshTimer?: NodeJS.Timeout

  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
    this.item.command = 'sigrank.openDashboard'
    this.item.text = '$(pulse) SigRank'
    this.item.tooltip = 'SigRank — click to open dashboard'
    this.item.show()
  }

  update(metrics: CascadeMetrics | null) {
    if (!metrics) {
      this.item.text = '$(pulse) SigRank —'
      this.item.tooltip = 'SigRank — no data yet. Click to pull your tokens.'
      return
    }

    const config = vscode.workspace.getConfiguration('sigrank')
    const fmt = config.get('statusBarFormat', 'Υ {yield} · {class}')
    const glyph = CLASS_GLYPHS[metrics.class] || ''

    const text = fmt
      .replace('{yield}', this.fmtNum(metrics.yield_))
      .replace('{leverage}', this.fmtNum(metrics.leverage))
      .replace('{velocity}', this.fmtNum(metrics.velocity))
      .replace('{snr}', this.fmtNum(metrics.snr))
      .replace('{class}', glyph ? `${glyph} ${metrics.class}` : metrics.class)
      .replace('{rank}', '—')

    this.item.text = `$(pulse) ${text}`
    this.item.tooltip = metrics.card || `Υ ${this.fmtNum(metrics.yield_)} · ${metrics.class}`
  }

  setError(msg: string) {
    this.item.text = '$(error) SigRank'
    this.item.tooltip = `SigRank error: ${msg}`
  }

  setLoading() {
    this.item.text = '$(loading~spin) SigRank'
  }

  startAutoRefresh(intervalSeconds: number, callback: () => void) {
    this.stopAutoRefresh()
    if (intervalSeconds < 60) intervalSeconds = 60
    this.refreshTimer = setInterval(callback, intervalSeconds * 1000)
  }

  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = undefined
    }
  }

  private fmtNum(n: number): string {
    if (n >= 100) return n.toFixed(0)
    if (n >= 10) return n.toFixed(1)
    if (n >= 1) return n.toFixed(2)
    return n.toFixed(3)
  }

  dispose() {
    this.stopAutoRefresh()
    this.item.dispose()
  }
}
