// プレビューパネルに表示するHTMLを組み立てる
// bundledJs: esbuildでバンドルされたJavaScript（React、アイコン等）
// css: Tailwind CLIで生成されたCSS（カスタム設定対応）
export function buildPreviewHtml(bundledJs: string | null, errorMessage: string | null, css: string | null): string {
  const errorBanner = errorMessage
    ? `<div style="background: #fef2f2; color: #dc2626; padding: 8px 12px; border-bottom: 1px solid #fca5a5; font-size: 14px; white-space: pre-wrap;">${errorMessage}</div>`
    : "";

  const styleTag = css ? `<style>${css}</style>` : "";
  const script = bundledJs ? `<script>${bundledJs}</script>` : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        ${styleTag}
        <style>body { margin: 0; padding: 16px; }</style>
      </head>
      <body>
        ${errorBanner}
        <div id="root"></div>
        ${script}
      </body>
    </html>
  `;
}
