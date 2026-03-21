import { jsxToHtml } from "./jsxToHtml";

// プレビューパネルに表示するHTMLを組み立てる
// cssが渡された場合はそれを使い、なければスタイルなしで表示
export function buildPreviewHtml(jsxBlock: string | null, error: boolean, css: string | null): string {
  const errorBanner = error
    ? `<div style="background: #fef2f2; color: #dc2626; padding: 8px 12px; border-bottom: 1px solid #fca5a5; font-size: 14px;">解析エラー: JSXの構文が不完全です</div>`
    : "";

  const content = jsxBlock ? jsxToHtml(jsxBlock) : "";
  const styleTag = css ? `<style>${css}</style>` : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        ${styleTag}
      </head>
      <body>
        ${errorBanner}
        ${content}
      </body>
    </html>
  `;
}
