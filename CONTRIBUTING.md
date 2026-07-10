# Contributing to SigRank VS Code Extension

Thanks for your interest! This is the VS Code extension for SigRank — token cascade metrics, leaderboard rank, and MCP bridge right in your editor.

## Quick start

```bash
git clone https://github.com/SunrisesIllNeverSee/sigrank-vscode
cd sigrank-vscode
npm install
npm run compile
```

Press `F5` in VS Code to launch an Extension Development Host with the extension loaded.

## Before you commit

```bash
npm run compile    # TypeScript compiles clean
npx tsc --noEmit   # 0 errors
```

## Invariants — do not break

- **Token-only.** No message content is ever read, logged, or transmitted.
- **Local by default.** The extension reads local session logs and publishes signed token counts only.
- **MCP bridge is opt-in.** `sigrank.mcpServerEnabled` defaults to `false`.

## Pull requests

Fork → branch → `npx tsc --noEmit` clean → open PR against `main`. Reference any related issues.
