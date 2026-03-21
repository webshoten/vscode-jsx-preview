# 公開手順

## 準備
1. Microsoftアカウントを作成
2. Azure DevOps (https://dev.azure.com) でPersonal Access Tokenを取得
   - スコープ: Marketplace > Manage
3. パブリッシャーを作成 (https://marketplace.visualstudio.com/manage)

## ツール
```bash
npm install -g @vscode/vsce
```

## package.json に追加
```json
"publisher": "your-publisher-name"
```

## パッケージ化
```bash
vsce package
```
→ `jsx-preview-0.0.1.vsix` が生成される

## 公開
```bash
vsce login your-publisher-name
vsce publish
```

## 手動アップロード
CLIを使わず https://marketplace.visualstudio.com/manage から .vsix をアップロードも可能。
