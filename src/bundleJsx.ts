import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";
import { extractImports, findNodeModulesPaths } from "./resolveImports";

export interface BundleResult {
  js: string;
  css: string | null; // CSSのimportがあれば含まれる
  error?: string; // バンドルエラーのメッセージ
}

// JSXブロックをesbuildでバンドルする
//
// 1. JSXブロックをReactでレンダリングするコードに包む
// 2. esbuildでバンドル（importの解決、JSX変換、CSS抽出）
// 3. バンドルされたJSとCSSを返す
export async function bundleJsx(
  jsxBlock: string,
  filePath: string,
): Promise<BundleResult | null> {
  const fileDir = path.dirname(filePath);

  const tmpDir = path.join(fileDir, "node_modules", ".jsx-preview");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const tmpEntry = path.join(tmpDir, "entry.tsx");

  // 元ファイルからimport文を抽出する
  // （import "./style.css" やimport { FaUser } from "react-icons/fa" 等）
  const originalCode = fs.readFileSync(filePath, "utf-8");
  const imports = extractImports(originalCode, fileDir);

  // JSXブロックをReactでレンダリングするエントリーコードを作る
  const entryCode = `
    import React from "react";
    import { createRoot } from "react-dom/client";
    ${imports}

    const Preview = () => {
      return (
        ${jsxBlock}
      );
    };

    const root = createRoot(document.getElementById("root"));
    root.render(<Preview />);
  `;

  fs.writeFileSync(tmpEntry, entryCode);

  try {
    const result = await esbuild.build({
      entryPoints: [tmpEntry],
      bundle: true,
      write: false, // ファイルに書かず文字列で返す
      outdir: tmpDir, // CSSの分離出力に必要（実際には書き込まない）
      format: "iife", // ブラウザで即実行できる形式
      jsx: "automatic", // React 17+ の新しいJSX変換
      // 編集中ファイルのディレクトリからimportを解決する
      resolveExtensions: [".tsx", ".ts", ".jsx", ".js"],
      nodePaths: [
        path.join(fileDir, "node_modules"),
        // 親ディレクトリのnode_modulesも探す（モノレポ対応）
        ...findNodeModulesPaths(fileDir),
      ],
    });

    if (result.outputFiles && result.outputFiles.length > 0) {
      // esbuildはJS(.js)とCSS(.css)を別ファイルとして出力する
      const jsFile = result.outputFiles.find((f) => f.path.endsWith(".js"));
      const cssFile = result.outputFiles.find((f) => f.path.endsWith(".css"));

      if (jsFile) {
        return {
          js: jsFile.text,
          css: cssFile?.text ?? null,
        };
      }
    }
  } catch (e: any) {
    console.error("[JSX Preview] バンドル失敗:");
    console.error("[JSX Preview] エラー:", e?.message || e);
    if (e?.errors) {
      console.error("[JSX Preview] 詳細:", JSON.stringify(e.errors, null, 2));
    }

    // esbuildのエラーから最初のメッセージを取得
    const errorText = e?.errors?.[0]?.text || e?.message ||
      "バンドルに失敗しました";
    return { js: "", css: null, error: errorText };
  }

  return null;
}
