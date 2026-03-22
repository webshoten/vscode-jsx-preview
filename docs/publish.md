# 公開手順

## 1. 事前準備（初回のみ）

### 1-1. Microsoftアカウントを作成
まだ持っていなければ作成する。

### 1-2. パブリッシャーを作成
1. https://marketplace.visualstudio.com/manage にアクセス・ログイン
2. 「Create Publisher」をクリック
3. 以下を入力:
   - **Name**: 表示名（例: "Taro Yamada"）
   - **ID**: 一意のID（例: "taro-yamada"）→ `package.json` の `publisher` に設定する値
4. 「Verified domain」はスキップでOK（認証済みバッジが欲しい場合のみ）

### 1-3. vsce をインストール
```bash
npm install -g @vscode/vsce
```

## 2. パッケージ化

`.vsix` ファイルを生成する。これが配布用の拡張機能ファイル。

```bash
vsce package
```

→ `jsx-preview-0.0.1.vsix` のようなファイルが生成される

## 3. 公開

### 方法A: Webからアップロード（簡単）
1. https://marketplace.visualstudio.com/manage にアクセス
2. パブリッシャーを選択
3. 「New Extension」→「Visual Studio Code」
4. 生成された `.vsix` ファイルをアップロード

### 方法B: CLIから公開（PATが必要）
1. Azure DevOps (https://dev.azure.com) でPersonal Access Token (PAT) を取得
   - 右上のユーザーアイコン → Personal Access Tokens
   - 「New Token」で作成
   - Organization: All accessible organizations
   - スコープ: Marketplace > Manage
   - 生成されたトークンを控えておく（再表示不可）
2. ログインして公開:
```bash
vsce login your-publisher-name
vsce publish
```

## 4. バージョン更新時

`package.json` の `version` を上げてから、同じ手順でパッケージ化 → 公開する。
