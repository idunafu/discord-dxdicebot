# DX Dice Bot

ダブルクロス2nd,3rd専用のDiscordダイスボット

## 概要

このボットは、ダブルクロス2nd,3rdのダイス判定を自動化するDiscordボットです。  
bcdice-jsとdiscord.jsを使用してTypeScriptで開発されています。

## 機能

- ダブルクロス専用ダイス判定
- クリティカル値指定対応
- 修正値自動計算
- 美しい埋め込みメッセージでの結果表示
- スラッシュコマンドによるヘルプ・情報表示

## コマンド

### ダイス判定（プレフィックス形式）

```
!dx [個数]DX[クリティカル値][修正値]
```

#### 使用例

```
!dx 8DX+5          # 8個のダイス、修正値+5
!dx 7DX8+3         # 7個のダイス、クリティカル値8、修正値+3
!dx 10DX+0@7       # 10個のダイス、クリティカル値7、修正値なし
```

### 情報系（スラッシュコマンド）

- `/dxhelp` - ヘルプを表示
- `/dxinfo` - ボット情報を表示

## 開発環境セットアップ

### 前提条件

- Node.js 18以上
- pnpm
- volta（推奨）

### インストール

1. リポジトリをクローン

```bash
git clone <repository-url>
cd discord-dx-dicebot
```

2. 依存関係をインストール

```bash
pnpm install
```

3. 環境変数を設定

```bash
cp .env.example .env
# .envファイルを編集してDiscordボットのトークン等を設定
```

### 環境変数

```env
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_bot_client_id_here
GUILD_ID=your_test_guild_id_here
NODE_ENV=development
```

### 開発用コマンド

```bash
# 開発モードで起動
pnpm dev

# ビルド
pnpm build

# 本番モードで起動
pnpm start

# 型チェック
pnpm lint

# ビルド成果物をクリア
pnpm clean
```

## Discordボットの作成

1. [Discord Developer Portal](https://discord.com/developers/applications) にアクセス
2. 「New Application」をクリックして新しいアプリケーションを作成
3. 「Bot」タブでボットユーザーを作成
4. 「Token」をコピーして環境変数に設定
5. 「OAuth2」タブの「URL Generator」でボット招待URLを生成
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Use Slash Commands`, `Embed Links`

## デプロイ

### VPS

1. サーバーにNode.js 18以上をインストール
2. プロジェクトをデプロイ
3. 環境変数を設定
4. `pnpm install --prod` で本番用依存関係をインストール
5. `pnpm build` でビルド
6. `pnpm start` で起動

### PM2を使用した管理

```bash
# PM2をインストール
pnpm add -g pm2

# ボットを起動
pm2 start dist/index.js --name "dx-dice-bot"

# ログを確認
pm2 logs dx-dice-bot

# 再起動
pm2 restart dx-dice-bot
```

## ライセンス

MIT

## 開発技術スタック

- **TypeScript** - 型安全な開発
- **Discord.js v14** - Discord API
- **bcdice v4.8.0** - ダイス処理エンジン
- **Node.js 18+** - ランタイム
- **pnpm** - パッケージマネージャー
- **volta** - Node.jsバージョン管理

## 貢献

バグレポートや機能提案は、GitHubのIssuesでお願いします。

## 更新履歴

### v1.0.0

- 初回リリース
- ダブルクロス専用ダイス判定機能
- スラッシュコマンド対応
- TypeScript + Discord.js + bcdice-js 構成
