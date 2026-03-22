import * as vscode from "vscode";
import { createHoverProvider } from "./hoverProvider";
import { extractJsxBlock } from "./extractJsxBlock";
import { bundleJsx } from "./bundleJsx";
import { buildPreviewHtml } from "./buildPreviewHtml";
import { generateTailwindCss } from "./generateTailwindCss";

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

      if (bundle) {
        console.log("[JSX Preview] bundle.css:", bundle.css ? `${bundle.css.length}文字` : "null");
        console.log("[JSX Preview] tailwindCss:", tailwindCss ? `${tailwindCss.length}文字` : "null");
        lastValidJs = bundle.js;
        // 実際のプロジェクトと同じ読み込み順を再現する:
        //   1. Tailwind CSS（globals.cssに相当。@tailwind base のリセット含む）
        //   2. コンポーネントのCSS（import "./style.css" 等）
        // CSSは後に読み込まれたものが同じ詳細度なら優先されるため、
        // コンポーネント固有のスタイルがTailwindのリセットを上書きできる
        const allCss = [tailwindCss, bundle.css].filter(Boolean).join("\n");
        lastValidCss = allCss || null;
        console.log("[JSX Preview] allCss:", lastValidCss ? `${lastValidCss.length}文字` : "null");
        panel.webview.html = buildPreviewHtml(bundle.js, false, lastValidCss);
      } else {
        panel.webview.html = buildPreviewHtml(lastValidJs, true, lastValidCss);
      }
    } else {
      panel.webview.html = buildPreviewHtml(lastValidJs, true, lastValidCss);
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
          { enableScripts: true }
        );
        panel.onDidDispose(() => {
          panel = undefined;
          currentLine = undefined;
          lastValidJs = null;
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
