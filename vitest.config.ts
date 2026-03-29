import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Node.js環境で実行（esbuild-wasmがNode.jsを必要とするため）
    // jsdomはテスト内で個別にインスタンス化して使う
    environment: "node",
    globals: true,
    testTimeout: 30000,
  },
});
