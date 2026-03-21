import * as vscode from "vscode";
import { createHoverProvider } from "./hoverProvider";
import { extractJsxBlock } from "./extractJsxBlock";
import { buildPreviewHtml } from "./buildPreviewHtml";
import { generateTailwindCss } from "./generateTailwindCss";

export const COMMAND_NAME = "jsxPreview.show";

export function activate(context: vscode.ExtensionContext) {
  const hoverProvider = createHoverProvider();

  let panel: vscode.WebviewPanel | undefined;

  // 現在プレビュー中の行番号を保持（テキスト変更時に再描画するため）
  let currentLine: number | undefined;

  // 前回成功した状態を保持（エラー時に表示を維持するため）
  let lastValidBlock: string | null = null;
  let lastValidCss: string | null = null;

  // プレビューを更新する共通関数
  function updatePreview(document: vscode.TextDocument, line: number) {
    if (!panel) {
      return;
    }

    const jsxBlock = extractJsxBlock(document, line);

    if (jsxBlock) {
      // 解析成功 → Tailwind CSSを生成して更新
      lastValidBlock = jsxBlock;
      lastValidCss = generateTailwindCss(jsxBlock, document.uri.fsPath);
      panel.webview.html = buildPreviewHtml(jsxBlock, false, lastValidCss);
    } else {
      // 解析失敗 → 前回の表示を維持 + エラー表示
      panel.webview.html = buildPreviewHtml(lastValidBlock, true, lastValidCss);
    }
  }

  // [Preview] クリック時のコマンド
  const command = vscode.commands.registerCommand(
    COMMAND_NAME,
    (args: { file: string; line: number }) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      currentLine = args.line;

      if (!panel) {
        panel = vscode.window.createWebviewPanel(
          "jsxPreview",
          "JSX Preview",
          vscode.ViewColumn.Beside,
          { enableScripts: true }
        );
        panel.onDidDispose(() => {
          panel = undefined;
          currentLine = undefined;
          lastValidBlock = null;
        });
      }

      updatePreview(editor.document, args.line);
    }
  );

  // ファイル保存時に自動更新
  const watcher = vscode.workspace.onDidSaveTextDocument((document) => {
    if (!panel || currentLine === undefined) {
      return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document !== document) {
      return;
    }

    updatePreview(document, currentLine);
  });

  context.subscriptions.push(hoverProvider, command, watcher);
}

export function deactivate() {}
