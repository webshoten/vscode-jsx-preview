import * as vscode from "vscode";

// 指定行のJSXブロック（開始タグ〜閉じタグ）を取得する
//
// depthで開始タグと閉じタグの対応を追跡する:
//   <div>          ← depth: 1
//     <div>        ← depth: 2
//     </div>       ← depth: 1
//   </div>         ← depth: 0 → ここまで取得
export function extractJsxBlock(document: vscode.TextDocument, startLine: number): string | null {
  const text = document.lineAt(startLine).text;

  // 開始タグのタグ名を取得（例: <div → "div"）
  const tagMatch = text.match(/<(\w+)/);
  if (!tagMatch) {
    return null;
  }
  const tagName = tagMatch[1];

  // 自己閉じタグの場合（例: <img /> ）はその行だけ返す
  if (text.match(/<\w+[^>]*\/>/)) {
    return text.trim();
  }

  // 開始タグと閉じタグのネスト数を数えて対応する閉じタグを見つける
  let depth = 0;
  const lines: string[] = [];

  for (let i = startLine; i < document.lineCount; i++) {
    const line = document.lineAt(i).text;
    lines.push(line);

    // 開始タグの数をカウント（<tagName で始まるもの）
    const openTags = line.match(new RegExp(`<${tagName}[\\s>]`, "g"));
    if (openTags) {
      depth += openTags.length;
    }

    // 閉じタグの数をカウント（</tagName>）
    const closeTags = line.match(new RegExp(`</${tagName}>`, "g"));
    if (closeTags) {
      depth -= closeTags.length;
    }

    // depth が 0 になったら対応する閉じタグを見つけた
    if (depth === 0) {
      break;
    }
  }

  return lines.join("\n");
}
