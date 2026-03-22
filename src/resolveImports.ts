import * as path from "path";
import * as fs from "fs";

// 元ファイルからimport文を抽出する（React/ReactDOMは除く、エントリーコードで別途追加するため）
// 相対パスのimportは元ファイルのディレクトリからの絶対パスに変換する
//
// 例: /project/src/App.tsx に import "./style.css" がある場合
//   → import "/project/src/style.css" に変換
//   一時ファイルは別の場所にあるため、相対パスだと解決できないため
export function extractImports(code: string, fileDir: string): string {
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
export function findNodeModulesPaths(startDir: string): string[] {
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
