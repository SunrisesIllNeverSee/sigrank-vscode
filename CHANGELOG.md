# Changelog

All notable changes to the SigRank VS Code extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- CHANGELOG.md
- CI/CD workflow (GitHub Actions)
- VS Code debug configurations (.vscode/launch.json, tasks.json)
- Shared utilities module (src/utils.ts)
- Unit tests

### Fixed
- XSS vulnerabilities in cascade webview (HTML escaping)
- Unused imports in extension.ts
- Silent error handling in sigrankClient.ts
- Duplicate formatting functions extracted to shared utils.ts

## [0.1.0] - 2026-07-09

### Added
- Cascade metrics webview dashboard
- Leaderboard webview panel
- Status bar integration with live yield display
- MCP server bridge (start/stop from VS Code)
- Submit signed snapshot command
- Dry run (inspect payload) command
- Auto-refresh configuration
- Privacy-first design (token-only, no message content)
- MIT license
- Contributing guidelines, security policy, code of conduct
- Issue templates (bug report, feature request)
