import * as path from "path";
import * as fs from "fs";
import * as esbuild from "esbuild";

export interface BundleResult {
  js: string;
  css: string | null; // CSSのimportがあれば含まれる
}

// JSXブロックをesbuildでバンドルする
//
// 1. JSXブロックをReactでレンダリングするコードに包む
// 2. esbuildでバンドル（importの解決、JSX変換、CSS抽出）
// 3. バンドルされたJSとCSSを返す
export async function bundleJsx(jsxBlock: string, filePath: string): Promise<BundleResult | null> {
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

  console.log("[JSX Preview] エントリーコード:\n", entryCode);
  fs.writeFileSync(tmpEntry, entryCode);

  try {
    const result = await esbuild.build({
      entryPoints: [tmpEntry],
      bundle: true,
      write: false,        // ファイルに書かず文字列で返す
      outdir: tmpDir,      // CSSの分離出力に必要（実際には書き込まない）
      format: "iife",      // ブラウザで即実行できる形式
      jsx: "automatic",    // React 17+ の新しいJSX変換
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
  }

  return null;
}

// 元ファイルからimport文を抽出する（React/ReactDOMは除く、エントリーコードで別途追加するため）
// 相対パスのimportは元ファイルのディレクトリからの絶対パスに変換する
//
// 例: /project/src/App.tsx に import "./style.css" がある場合
//   → import "/project/src/style.css" に変換
//   一時ファイルは別の場所にあるため、相対パスだと解決できないため
function extractImports(code: string, fileDir: string): string {
  return code
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith("import ")) {
        return false;
      }
      if (trimmed.includes("from \"react\"") || trimmed.includes("from 'react'")) {
        return false;
      }
      if (trimmed.includes("from \"react-dom") || trimmed.includes("from 'react-dom")) {
        return false;
      }
      return true;
    })
    .map((line) => {
      // 相対パス（"./" や "../"）を絶対パスに変換
      return line.replace(/from\s+["'](\.[^"']+)["']/, (_match, relPath) => {
        const absPath = path.resolve(fileDir, relPath);
        return `from "${absPath}"`;
      }).replace(/import\s+["'](\.[^"']+)["']/, (_match, relPath) => {
        // import "./style.css" のようなside-effect importの場合
        const absPath = path.resolve(fileDir, relPath);
        return `import "${absPath}"`;
      });
    })
    .join("\n");
}

// 親ディレクトリを辿ってnode_modulesのパスを集める（モノレポ対応）
function findNodeModulesPaths(startDir: string): string[] {
  const paths: string[] = [];
  let dir = startDir;

  while (true) {
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;

    const nodeModules = path.join(dir, "node_modules");
    if (fs.existsSync(nodeModules)) {
      paths.push(nodeModules);
    }
  }

  return paths;
}
