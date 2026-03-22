import * as vscode from "vscode";
import { buildPreviewHtml } from "./buildPreviewHtml";
import { bundleJsx } from "./bundleJsx";
import { extractJsxBlock } from "./extractJsxBlock";
import { generateTailwindCss } from "./generateTailwindCss";
import { createHoverProvider } from "./hoverProvider";

export const COMMAND_NAME = "jsxPreview.show";

export function activate(context: vscode.ExtensionContext) {
  const hoverProvider = createHoverProvider();

  let panel: vscode.WebviewPanel | undefined;
  let currentLine: number | undefined;

  // 前回成功した結果を保持
  let lastValidJs: string | null = null;
  let lastValidCss: string | null = null;

  // プレビューを更新する共通関数
  async function updatePreview(document: vscode.TextDocument, line: number) {
    if (!panel) {
      return;
    }

    // JSXブロックを抽出する
    const jsxBlock = extractJsxBlock(document, line);

    if (jsxBlock) {
      const bundle = await bundleJsx(jsxBlock, document.uri.fsPath);
      const tailwindCss = generateTailwindCss(jsxBlock, document.uri.fsPath);

      if (bundle?.error) {
        // バンドルエラー: エラーメッセージを表示しつつ前回の結果を維持
        panel.webview.html = buildPreviewHtml(
          lastValidJs,
          bundle.error,
          lastValidCss,
        );
      } else if (bundle) {
        lastValidJs = bundle.js;
        const allCss = [tailwindCss, bundle.css].filter(Boolean).join("\n");
        lastValidCss = allCss || null;
        panel.webview.html = buildPreviewHtml(bundle.js, null, lastValidCss);
      } else {
        panel.webview.html = buildPreviewHtml(
          lastValidJs,
          "JSXブロックを解析できませんでした",
          lastValidCss,
        );
      }
    } else {
      panel.webview.html = buildPreviewHtml(
        lastValidJs,
        "JSXブロックが見つかりません",
        lastValidCss,
      );
    }
  }

  // [JSX Preview] クリック時のコマンド
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
          { enableScripts: true },
        );
        panel.onDidDispose(() => {
          panel = undefined;
          currentLine = undefined;
          lastValidJs = null;
        });
      }

      updatePreview(editor.document, args.line);
    },
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
