# 公開手順

## 準備

### 1. Microsoftアカウントを作成

### 2. パブリッシャーを作成
1. https://marketplace.visualstudio.com/manage にアクセス・ログイン
2. 「Create Publisher」をクリック
3. 以下を入力:
   - **Name**: 表示名（例: "Taro Yamada"）
   - **ID**: 一意のID（例: "taro-yamada"）→ これが `package.json` の `publisher` になる
4. 「Verified domain」はスキップでOK（認証済みバッジが欲しい場合のみ設定）

### 3. Personal Access Token (PAT) を取得
1. Azure DevOps (https://dev.azure.com) にアクセス
2. 右上のユーザーアイコン → Personal Access Tokens
3. 「New Token」で作成:
   - Organization: All accessible organizations
   - スコープ: Marketplace > Manage
4. 生成されたトークンを控えておく（再表示不可）

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
