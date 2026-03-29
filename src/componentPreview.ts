import * as vscode from "vscode";

export interface ComponentPreviewResult {
  jsxBlock: string;
  componentName: string;
}

// カーソル位置がコンポーネント定義内で @preview コメントがあれば、そのJSXを返す
// @preview がなければ null を返し、従来の extractJsxBlock にフォールバックする
export function buildComponentPreview(
  document: vscode.TextDocument,
  line: number,
): ComponentPreviewResult | null {
  const component = findEnclosingComponent(document, line);
  if (!component) {
    return null;
  }

  // @preview コメントがあればそれを使う。なければ null（従来動作へ）
  const previewComment = findPreviewComment(document, component.startLine);
  if (!previewComment) {
    return null;
  }

  return { jsxBlock: previewComment, componentName: component.name };
}

// カーソル行を含むコンポーネント定義を探す（大文字始まりの関数/const）
function findEnclosingComponent(
  document: vscode.TextDocument,
  line: number,
): { name: string; startLine: number } | null {
  for (let i = line; i >= 0; i--) {
    const text = document.lineAt(i).text;
    const match = text.match(
      /(?:export\s+)?(?:const|function)\s+([A-Z]\w*)\s*[=(]/,
    );
    if (match) {
      return { name: match[1], startLine: i };
    }
  }
  return null;
}

// コンポーネント定義の上にある @preview コメントを探す
//
// 単一行: // @preview <Card title="Hello"><p>Content</p></Card>
// 複数行: /* @preview
//          <Card title="Hello">
//            <p>Content</p>
//          </Card>
//          */
function findPreviewComment(
  document: vscode.TextDocument,
  componentStartLine: number,
): string | null {
  // コンポーネント定義の直上5行以内を探す
  for (let i = componentStartLine - 1; i >= Math.max(0, componentStartLine - 5); i--) {
    const text = document.lineAt(i).text.trim();

    // 単一行: // @preview <Foo ...>
    const singleMatch = text.match(/^\/\/\s*@preview\s+(.+)$/);
    if (singleMatch) {
      return singleMatch[1];
    }

    // 複数行の終端: */
    if (text.endsWith("*/")) {
      return parseBlockPreviewComment(document, i);
    }

    // コメントでも空行でもない行に当たったら終了
    if (text && !text.startsWith("//") && !text.startsWith("*")) {
      break;
    }
  }
  return null;
}

// /* @preview ... */ ブロックコメントをパースする
function parseBlockPreviewComment(
  document: vscode.TextDocument,
  endLine: number,
): string | null {
  const lines: string[] = [];

  for (let i = endLine; i >= Math.max(0, endLine - 30); i--) {
    const text = document.lineAt(i).text;

    if (text.includes("@preview")) {
      // @preview の後の文字列を最初の行として追加
      const after = text.replace(/.*@preview\s*/, "").replace(/\s*\*\/\s*$/, "").trim();
      if (after) {
        lines.unshift(after);
      }

      const content = lines.join("\n").trim();
      return content || null;
    }

    // */ だけの行はスキップ
    if (text.trim() === "*/") {
      continue;
    }

    // 中間行: 先頭の * やスペースを除去
    const cleaned = text.replace(/^\s*\*\s?/, "").replace(/\s*\*\/\s*$/, "").trim();
    if (cleaned) {
      lines.unshift(cleaned);
    }
  }

  return null;
}

// コンポーネントのprops型を抽出する
//
// 以下のパターンに対応:
// - type CardProps = { title: string; children: React.ReactNode; }
// - インライン: ({ title, children }: { title: string; ... })
function extractPropTypes(
  code: string,
  componentName: string,
): Record<string, string> {
  const props: Record<string, string> = {};

  // パターン1: 名前付き型 (CardProps, ButtonProps 等)
  const compRegex = new RegExp(
    `(?:const|function)\\s+${componentName}[^(]*\\(\\s*(?:\\{[^}]*\\}\\s*:\\s*)(\\w+)`,
  );
  const compMatch = code.match(compRegex);

  if (compMatch) {
    const typeName = compMatch[1];
    // type TypeName = { ... } または interface TypeName { ... }
    const typeRegex = new RegExp(
      `(?:type|interface)\\s+${typeName}\\s*=?\\s*\\{([^}]+)\\}`,
    );
    const typeMatch = code.match(typeRegex);
    if (typeMatch) {
      parsePropsFromBlock(typeMatch[1], props);
      return props;
    }
  }

  // パターン2: インライン型 ({ title, children }: { title: string; ... })
  const inlineRegex = new RegExp(
    `(?:const|function)\\s+${componentName}[^{]*\\{[^}]*\\}\\s*:\\s*\\{([^}]+)\\}`,
  );
  const inlineMatch = code.match(inlineRegex);
  if (inlineMatch) {
    parsePropsFromBlock(inlineMatch[1], props);
  }

  return props;
}

// "title: string; count?: number;" のようなブロックをパースする
function parsePropsFromBlock(block: string, props: Record<string, string>) {
  const lines = block.split(/[;\n]/);
  for (const line of lines) {
    const match = line.trim().match(/^(\w+)\??\s*:\s*(.+)$/);
    if (match) {
      props[match[1]] = match[2].trim();
    }
  }
}

// コンポーネントの分割代入からデフォルト値があるpropsを抽出する
// 例: ({ variant = "primary", size = 16 }: Props) → Set("variant", "size")
function extractDefaultValues(code: string, componentName: string): Set<string> {
  const defaults = new Set<string>();

  const regex = new RegExp(
    `(?:const|function)\\s+${componentName}[^(]*\\(\\s*\\{([^}]+)\\}`,
  );
  const match = code.match(regex);
  if (!match) {
    return defaults;
  }

  const destructured = match[1];
  const defaultRegex = /(\w+)\s*=\s*/g;
  let m: RegExpExecArray | null;
  while ((m = defaultRegex.exec(destructured)) !== null) {
    defaults.add(m[1]);
  }

  return defaults;
}

// 型からデフォルト値を生成する
function defaultValueForType(type: string): string {
  const t = type.trim();

  if (t === "string") {
    return "Text";
  }
  if (t === "number") {
    return "0";
  }
  if (t === "boolean") {
    return "true";
  }
  if (t.includes("ReactNode") || t.includes("ReactElement")) {
    return "<span>Content</span>";
  }
  // 文字列リテラルのunion: "primary" | "danger" → 最初の値
  const unionMatch = t.match(/^["']([^"']+)["']/);
  if (unionMatch) {
    return unionMatch[1];
  }
  // 配列
  if (t.endsWith("[]") || t.startsWith("Array<")) {
    return "[]";
  }

  return "undefined";
}

// props属性をJSX形式にフォーマットする
function formatPropAttribute(name: string, type: string, value: string): string {
  const t = type.trim();

  // string型 と 文字列リテラルunion は文字列として渡す
  if (t === "string" || t.match(/^["']/)) {
    return `${name}="${value}"`;
  }

  // それ以外は {} で囲む
  return `${name}={${value}}`;
}
