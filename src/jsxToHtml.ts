// JSXをHTMLに変換する
// まずはシンプルに className → class の置き換えのみ
export function jsxToHtml(jsx: string): string {
  return jsx.replace(/className=/g, "class=");
}
