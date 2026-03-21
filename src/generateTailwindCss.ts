import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";

const CONFIG_NAMES = [
  "tailwind.config.js",
  "tailwind.config.ts",
  "tailwind.config.mjs",
  "tailwind.config.cjs",
];

// 編集中のファイルから親ディレクトリを順に上がって tailwind.config を探す
//
// 例: /root/packages/web/src/App.tsx の場合
//   /root/packages/web/src/ → なし
//   /root/packages/web/     → tailwind.config.js 発見！
function findTailwindConfig(filePath: string): string | null {
  let dir = path.dirname(filePath);

  while (true) {
    const found = CONFIG_NAMES
      .map((name) => path.join(dir, name))
      .find((p) => fs.existsSync(p));

    if (found) {
      return found;
    }

    // 親ディレクトリに上がる
    const parent = path.dirname(dir);
    if (parent === dir) {
      // ルートまで到達（これ以上上がれない）
      return null;
    }
    dir = parent;
  }
}

// プロジェクトのTailwind CLIを使ってJSXブロックからCSSを生成する
//
// 1. 編集中ファイルの近くから tailwind.config を探す
// 2. JSXブロックを一時ファイルに書き出す
// 3. npx tailwindcss で一時ファイルを対象にCSS生成
// 4. 生成されたCSSを返す
export function generateTailwindCss(jsxBlock: string, filePath: string): string | null {
  const configPath = findTailwindConfig(filePath);
  if (!configPath) {
    return null;
  }

  // configがあるディレクトリ = そのパッケージのルート
  const projectDir = path.dirname(configPath);

  // 一時ファイルにJSXブロックを書き出す
  const tmpDir = path.join(projectDir, "node_modules", ".jsx-preview");
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const tmpInput = path.join(tmpDir, "input.tsx");
  const tmpCss = path.join(tmpDir, "input.css");
  const tmpOutput = path.join(tmpDir, "output.css");

  fs.writeFileSync(tmpInput, jsxBlock);
  fs.writeFileSync(tmpCss, "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n");

  try {
    // npx tailwindcss でCSS生成を実行:
    //   -i "${tmpCss}"       : 入力CSS（@tailwind ディレクティブが書かれたファイル）
    //   -o "${tmpOutput}"    : 生成されたCSSの出力先
    //   --content "${tmpInput}" : このファイル内のクラス名を検出対象にする
    //   -c "${configPath}"   : プロジェクトのtailwind.configを使う
    //   --minify             : 出力CSSを圧縮する
    //
    // execSyncのオプション:
    //   cwd: projectDir      : コマンドをプロジェクトのディレクトリで実行
    //   timeout: 10000       : 10秒でタイムアウト
    //   stdio: "pipe"        : コマンドの出力をキャプチャ（コンソールに出さない）
    execSync(
      `npx tailwindcss -i "${tmpCss}" -o "${tmpOutput}" --content "${tmpInput}" -c "${configPath}" --minify`,
      {
        cwd: projectDir,
        timeout: 10000,
        stdio: "pipe",
      }
    );

    if (fs.existsSync(tmpOutput)) {
      return fs.readFileSync(tmpOutput, "utf-8");
    }
  } catch {
    // Tailwind CLI実行に失敗した場合はnullを返す
  }

  return null;
}
