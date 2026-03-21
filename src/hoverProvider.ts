import * as vscode from "vscode";
import { COMMAND_NAME } from "./extension";

// ホバーした時に [Preview] リンクを表示する
export function createHoverProvider(): vscode.Disposable {
  return vscode.languages.registerHoverProvider(
    ["typescriptreact", "javascriptreact"],
    {
      provideHover(document, position) {
        const line = document.lineAt(position.line).text;

        // カーソル位置にJSXタグがあるかチェック（<div, <Button 等）
        const tagMatch = line.match(/<(\w+)/);
        if (!tagMatch) {
          return null;
        }

        // command URI でクリック時にコマンドを実行する
        const args = encodeURIComponent(
          JSON.stringify({
            file: document.uri.toString(),
            line: position.line,
          })
        );
        const commandUri = `command:${COMMAND_NAME}?${args}`;
        const markdown = new vscode.MarkdownString(
          `[JSX Preview](${commandUri})`
        );
        markdown.isTrusted = true;

        return new vscode.Hover(markdown);
      },
    }
  );
}
