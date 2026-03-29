import { describe, it, expect, beforeAll } from "vitest";
import { JSDOM } from "jsdom";
import * as path from "path";
import * as fs from "fs";
import { bundleJsx } from "../src/bundleJsx";
import { extractImports } from "../src/resolveImports";

const EXAMPLE_DIR = path.resolve(__dirname, "../example");

// exampleファイルからJSXブロックを抽出する（テスト用の簡易版）
// vscode APIに依存しない
function extractJsxBlockFromFile(filePath: string, startLine: number): string | null {
  const lines = fs.readFileSync(filePath, "utf-8").split("\n");
  const text = lines[startLine];

  const tagMatch = text.match(/<(\w+)/);
  if (!tagMatch) return null;
  const tagName = tagMatch[1];

  if (text.match(/<\w+[^>]*\/>/)) return text.trim();

  let depth = 0;
  const result: string[] = [];

  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];
    result.push(line);

    const openTags = line.match(new RegExp(`<${tagName}[\\s>]`, "g"));
    if (openTags) depth += openTags.length;

    const closeTags = line.match(new RegExp(`</${tagName}>`, "g"));
    if (closeTags) depth -= closeTags.length;

    if (depth === 0) break;
  }

  return result.join("\n");
}

// バンドル結果をjsdomで実行し、レンダリングエラーがないか検証する
async function renderInJsdom(js: string): Promise<{ html: string; error: string | null }> {
  const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="root"></div></body></html>`, {
    runScripts: "dangerously",
    pretendToBeVisual: true,
  });

  let error: string | null = null;

  // consoleエラーをキャプチャ
  dom.window.console.error = (...args: unknown[]) => {
    const msg = args.map(String).join(" ");
    if (msg.includes("Error") || msg.includes("error")) {
      error = msg;
    }
  };

  try {
    dom.window.eval(js);
  } catch (e: any) {
    error = e.message;
  }

  // Reactのレンダリングはマイクロタスクで実行されるため待機する
  await new Promise((resolve) => setTimeout(resolve, 100));

  const html = dom.window.document.getElementById("root")?.innerHTML ?? "";
  return { html, error };
}

describe("JSX Preview E2E", () => {

  // --- standard.tsx ---
  describe("standard.tsx", () => {
    it("トップの<div>がレンダリングされる", async () => {
      const filePath = path.join(EXAMPLE_DIR, "standard.tsx");
      // line 3: <div className="flex gap-4 p-6 bg-gray-100">
      const jsxBlock = extractJsxBlockFromFile(filePath, 3);
      console.log("[standard.tsx] JSXブロック:", jsxBlock);

      expect(jsxBlock).not.toBeNull();

      const bundle = await bundleJsx(jsxBlock!, filePath);
      console.log("[standard.tsx] バンドルエラー:", bundle?.error ?? "なし");
      console.log("[standard.tsx] バンドルJS長さ:", bundle?.js?.length ?? 0);

      expect(bundle).not.toBeNull();
      expect(bundle!.error).toBeUndefined();
      expect(bundle!.js.length).toBeGreaterThan(0);

      const { html, error } = await renderInJsdom(bundle!.js);
      console.log("[standard.tsx] レンダリングHTML:", html.substring(0, 200));
      console.log("[standard.tsx] レンダリングエラー:", error ?? "なし");

      expect(error).toBeNull();
      expect(html.length).toBeGreaterThan(0);
    });
  });

  // --- nested.tsx ---
  describe("nested.tsx", () => {
    it("トップの<div>がレンダリングされる（子コンポーネント含む）", async () => {
      const filePath = path.join(EXAMPLE_DIR, "nested.tsx");
      // line 6: <div className="p-6 bg-gray-100 flex flex-col gap-4">
      const jsxBlock = extractJsxBlockFromFile(filePath, 6);
      console.log("[nested.tsx] JSXブロック:", jsxBlock);

      expect(jsxBlock).not.toBeNull();

      const bundle = await bundleJsx(jsxBlock!, filePath);
      console.log("[nested.tsx] バンドルエラー:", bundle?.error ?? "なし");
      console.log("[nested.tsx] バンドルJS長さ:", bundle?.js?.length ?? 0);

      expect(bundle).not.toBeNull();
      expect(bundle!.error).toBeUndefined();
      expect(bundle!.js.length).toBeGreaterThan(0);

      const { html, error } = await renderInJsdom(bundle!.js);
      console.log("[nested.tsx] レンダリングHTML:", html.substring(0, 200));
      console.log("[nested.tsx] レンダリングエラー:", error ?? "なし");

      expect(error).toBeNull();
      expect(html.length).toBeGreaterThan(0);
    });
  });

  // --- components/Card.tsx (@preview付き) ---
  describe("components/Card.tsx", () => {
    it("@previewのJSXがレンダリングされる", async () => {
      const filePath = path.join(EXAMPLE_DIR, "components/Card.tsx");
      // @preview で指定されたJSX
      const jsxBlock = `<Card title="ユーザー設定"><p>アカウント情報を更新できます</p></Card>`;
      console.log("[Card.tsx] JSXブロック:", jsxBlock);

      const bundle = await bundleJsx(jsxBlock, filePath, "Card");
      console.log("[Card.tsx] バンドルエラー:", bundle?.error ?? "なし");
      console.log("[Card.tsx] バンドルJS長さ:", bundle?.js?.length ?? 0);

      expect(bundle).not.toBeNull();
      expect(bundle!.error).toBeUndefined();
      expect(bundle!.js.length).toBeGreaterThan(0);

      const { html, error } = await renderInJsdom(bundle!.js);
      console.log("[Card.tsx] レンダリングHTML:", html.substring(0, 200));
      console.log("[Card.tsx] レンダリングエラー:", error ?? "なし");

      expect(error).toBeNull();
      expect(html.length).toBeGreaterThan(0);
    });
  });

  // --- components/Button.tsx (@preview付き) ---
  describe("components/Button.tsx", () => {
    it("@previewのJSXがレンダリングされる", async () => {
      const filePath = path.join(EXAMPLE_DIR, "components/Button.tsx");
      // @preview で指定されたJSX
      const jsxBlock = `<Button variant="danger">削除する</Button>`;
      console.log("[Button.tsx] JSXブロック:", jsxBlock);

      const bundle = await bundleJsx(jsxBlock, filePath, "Button");
      console.log("[Button.tsx] バンドルエラー:", bundle?.error ?? "なし");
      console.log("[Button.tsx] バンドルJS長さ:", bundle?.js?.length ?? 0);

      expect(bundle).not.toBeNull();
      expect(bundle!.error).toBeUndefined();
      expect(bundle!.js.length).toBeGreaterThan(0);

      const { html, error } = await renderInJsdom(bundle!.js);
      console.log("[Button.tsx] レンダリングHTML:", html.substring(0, 200));
      console.log("[Button.tsx] レンダリングエラー:", error ?? "なし");

      expect(error).toBeNull();
      expect(html.length).toBeGreaterThan(0);
    });
  });

  // --- mixed.tsx (CSS import + Tailwind) ---
  describe("mixed.tsx", () => {
    it("トップの<div>がレンダリングされる", async () => {
      const filePath = path.join(EXAMPLE_DIR, "mixed.tsx");
      // line 4: <div className="card p-6">
      const jsxBlock = extractJsxBlockFromFile(filePath, 5);
      console.log("[mixed.tsx] JSXブロック:", jsxBlock);

      expect(jsxBlock).not.toBeNull();

      const bundle = await bundleJsx(jsxBlock!, filePath);
      console.log("[mixed.tsx] バンドルエラー:", bundle?.error ?? "なし");
      console.log("[mixed.tsx] バンドルJS長さ:", bundle?.js?.length ?? 0);

      expect(bundle).not.toBeNull();
      expect(bundle!.error).toBeUndefined();
      expect(bundle!.js.length).toBeGreaterThan(0);

      const { html, error } = await renderInJsdom(bundle!.js);
      console.log("[mixed.tsx] レンダリングHTML:", html.substring(0, 200));
      console.log("[mixed.tsx] レンダリングエラー:", error ?? "なし");

      expect(error).toBeNull();
      expect(html.length).toBeGreaterThan(0);
    });
  });
});
