# SigRank — VS Code Extension

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](./LICENSE)
[![platform](https://img.shields.io/badge/platform-VS%20Code-blue.svg?style=flat-square&logo=visualstudiocode)](https://code.visualstudio.com)
[![live](https://img.shields.io/badge/site-signalaf.com-gold.svg?style=flat-square)](https://signalaf.com)
[![MCP](https://img.shields.io/badge/MCP-bridge-purple.svg?style=flat-square)](https://modelcontextprotocol.io)

</div>

Token cascade metrics, leaderboard rank, and MCP bridge — right in VS Code.

## Why use the extension?

The SigRank CLI (`npx sigrank`) gives you the full TUI dashboard. The VS Code extension brings the same metrics to where you already work — your editor — with:
- **Status bar** — live Υ Yield + class tier, always visible while coding
- **Sidebar dashboard** — full cascade metrics without leaving the editor
- **Leaderboard view** — see where you rank without context-switching
- **MCP bridge** — let Copilot or Claude Code call SigRank tools directly from VS Code

## Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "SigRank"
4. Click Install

### From .vsix
```bash
code --install-extension sigrank-vscode-x.x.x.vsix
```

### Prerequisites
- Node ≥ 18
- `npx sigrank` (auto-installed on first run)
- macOS or Linux

## Features

### Status bar cascade
Shows your live Υ Yield, class tier, and rank in the VS Code status bar. Updates automatically on a configurable interval. Click to open the full dashboard.

### Sidebar dashboard
A sidebar panel with your full cascade metrics (Υ Yield, Leverage, Velocity, SNR, 10xDEV, class tier) across all four scoring windows (7d / 30d / 90d / all-time). Shows your raw token pillars (input, output, cache-write, cache-read) and the deterministic prose card.

### Leaderboard view
A second sidebar panel showing the live public SigRank leaderboard — every ranked operator with their yield, leverage, velocity, class, and rank position.

### MCP server bridge
Optionally runs the SigRank MCP server inside VS Code so AI clients (Copilot, Claude Code, etc.) can call sigrank tools directly from the editor — `tokenpull`, `get_leaderboard`, `rank_paste`, `submit_verified`, and 11 more.

## Commands

| Command | Description |
|---------|-------------|
| `SigRank: Refresh Metrics` | Pull your latest token data and refresh the leaderboard |
| `SigRank: Open Dashboard` | Focus the cascade sidebar |
| `SigRank: Open Leaderboard` | Focus the leaderboard sidebar |
| `SigRank: Submit Signed Snapshot` | Publish your token counts to the board |
| `SigRank: Dry Run (Inspect Payload)` | See the exact payload before submitting |
| `SigRank: Start MCP Server` | Start the MCP server for AI client integration |
| `SigRank: Stop MCP Server` | Stop the MCP server |

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `sigrank.autoRefresh` | `true` | Automatically refresh metrics on load |
| `sigrank.refreshIntervalSeconds` | `300` | Auto-refresh interval (min 60s) |
| `sigrank.mcpServerEnabled` | `false` | Start MCP server automatically when VS Code opens |
| `sigrank.apiBaseUrl` | `https://signalaf.com` | SigRank API base URL |
| `sigrank.statusBarFormat` | `Υ {yield} · {class}` | Status bar format. Variables: `{yield}`, `{leverage}`, `{velocity}`, `{snr}`, `{class}`, `{rank}` |

## Requirements

- Node ≥ 18
- `npx sigrank` (installed automatically on first run via npx)
- macOS or Linux

## Privacy

Token counts only. Never your prompts. The extension reads local session logs and publishes signed token counts — four integers and a signature. No prompt content, no code, no transcripts. Run `SigRank: Dry Run` to inspect the exact payload before anything leaves your machine.

## Contributing

Contributions welcome.

- Report bugs via [GitHub Issues](https://github.com/SunrisesIllNeverSee/sigrank-vscode/issues)
- PRs: fork → branch → `npx tsc --noEmit` clean → open PR against `main`
- See [sigrank-mcp](https://github.com/SunrisesIllNeverSee/sigrank-mcp) for the underlying CLI and MCP server

## License

MIT — see [`LICENSE`](./LICENSE).
