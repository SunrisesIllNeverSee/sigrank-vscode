"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardProvider = void 0;
class LeaderboardProvider {
    context;
    static viewType = 'sigrank.leaderboardView';
    view;
    onRefresh;
    constructor(context) {
        this.context = context;
    }
    setRefreshCallback(cb) {
        this.onRefresh = cb;
    }
    resolveWebviewView(view) {
        this.view = view;
        view.webview.options = {
            enableScripts: true,
            localResourceRoots: [],
        };
        view.webview.html = this.getHtml([]);
        view.webview.onDidReceiveMessage((msg) => {
            if (msg.type === 'refresh' && this.onRefresh) {
                this.onRefresh();
            }
        });
    }
    update(entries) {
        if (this.view) {
            this.view.webview.html = this.getHtml(entries);
        }
    }
    setError(msg) {
        if (this.view) {
            this.view.webview.html = this.getHtml([], msg);
        }
    }
    getHtml(entries, error) {
        const rows = entries.map((e) => `
      <tr class="${e.rank <= 3 ? 'top-rank' : ''}">
        <td class="rank">#${e.rank}</td>
        <td class="codename">${escapeHtml(e.codename)}</td>
        <td class="yield">${fmtNum(e.yield_)}</td>
        <td class="leverage">${fmtNum(e.leverage)}</td>
        <td class="velocity">${fmtNum(e.velocity)}</td>
        <td class="class">${e.class}</td>
      </tr>
    `).join('');
        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  body {
    font-family: var(--vscode-font-family, -apple-system, sans-serif);
    font-size: 12px;
    color: var(--vscode-foreground);
    background: var(--vscode-editor-background);
    padding: 8px;
    margin: 0;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .count {
    font-size: 10px;
    color: var(--vscode-descriptionForeground);
  }
  .btn {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
    border: none;
    padding: 3px 8px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th {
    text-align: left;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--vscode-descriptionForeground);
    padding: 4px 6px;
    border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
  }
  td {
    padding: 4px 6px;
    border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.04));
    font-family: var(--vscode-editor-font-family, monospace);
  }
  .rank {
    color: var(--vscode-descriptionForeground);
    width: 32px;
  }
  .top-rank .rank {
    color: #e8a838;
    font-weight: 600;
  }
  .codename {
    font-family: var(--vscode-font-family, sans-serif);
    font-weight: 500;
  }
  .yield {
    color: var(--vscode-textLink-foreground, #4daafc);
    font-weight: 600;
  }
  .class {
    font-size: 10px;
    color: var(--vscode-descriptionForeground);
  }
  .empty {
    text-align: center;
    padding: 30px 10px;
    color: var(--vscode-descriptionForeground);
    font-size: 11px;
  }
  .error {
    color: var(--vscode-errorForeground, #e85a5a);
    padding: 10px;
    font-size: 11px;
  }
</style>
</head>
<body>
  <div class="header">
    <span class="count">${entries.length} operators</span>
    <button class="btn" onclick="send('refresh')">↻</button>
  </div>
  ${error ? `<div class="error">${error}</div>` : ''}
  ${!error && entries.length === 0 ? '<div class="empty">No operators yet.</div>' : ''}
  ${entries.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>#</th><th>Operator</th><th>Υ</th><th>Lev</th><th>Vel</th><th>Class</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  ` : ''}
  <script>
    const vscode = acquireVsCodeApi();
    function send(type) { vscode.postMessage({ type }); }
  </script>
</body>
</html>`;
        function fmtNum(n) {
            if (n >= 100)
                return n.toFixed(0);
            if (n >= 10)
                return n.toFixed(1);
            if (n >= 1)
                return n.toFixed(2);
            return n.toFixed(3);
        }
        function escapeHtml(s) {
            return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
    }
}
exports.LeaderboardProvider = LeaderboardProvider;
//# sourceMappingURL=leaderboardProvider.js.map