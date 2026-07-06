export interface CascadeMetrics {
  yield_: number
  snr: number
  leverage: number
  velocity: number
  tenx_dev: number | null
  class: string
  card: string
  warnings: string[]
}

export interface TokenPillars {
  input: number
  output: number
  cacheCreate: number
  cacheRead: number
}

export interface WindowBreakdown {
  window: string
  pillars: TokenPillars
  cascade: CascadeMetrics
  estimated?: boolean
  dataGap?: string
}

export interface TokenPullResult {
  windows: WindowBreakdown[]
  platform: string
}

export interface LeaderboardEntry {
  codename: string
  yield_: number
  leverage: number
  velocity: number
  class: string
  rank: number
}

export interface OperatorProfile {
  codename: string
  yield_: number
  leverage: number
  velocity: number
  snr: number
  tenx_dev: number | null
  class: string
  rank: number
  windows?: WindowBreakdown[]
}
