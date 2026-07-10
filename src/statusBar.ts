import * as vscode from 'vscode'
import type { CascadeMetrics } from './types'
import { fmtNum } from './utils'

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
      .replace('{yield}', fmtNum(metrics.yield_))
      .replace('{leverage}', fmtNum(metrics.leverage))
      .replace('{velocity}', fmtNum(metrics.velocity))
      .replace('{snr}', fmtNum(metrics.snr))
      .replace('{class}', glyph ? `${glyph} ${metrics.class}` : metrics.class)
      .replace('{rank}', '—')

    this.item.text = `$(pulse) ${text}`
    this.item.tooltip = metrics.card || `Υ ${fmtNum(metrics.yield_)} · ${metrics.class}`
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

  dispose() {
    this.stopAutoRefresh()
    this.item.dispose()
  }
}
