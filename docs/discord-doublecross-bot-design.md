# ダブルクロス専用Discordダイスボット 設計書

## 📋 プロジェクト概要

### プロジェクト名

**DX Dice Bot** (DoubleXross Discord Dice Bot)

### 目的

ダブルクロス2nd,3rdに特化したDiscordダイスボットを作成し、TRPGセッションでのダイス判定を効率化する。

### 対象システム

- **ゲームシステム**: ダブルクロス2nd,3rd
- **BCDice ID**: `DoubleCross`
- **プラットフォーム**: Discord

## 🎯 機能要件

### Phase 1: 基本機能（MVP）

#### 1. **基本ダイス判定**

- ダブルクロス専用ダイスの判定
- クリティカル値の指定対応
- 成功・失敗の自動判定
- コマンド例：`!dx 10DX7+5`、`!dx 11DX+3@8`
- (個数)DX(クリティカル値)(修正値) または (個数)DX(修正値)@(クリティカル値)

#### 2. **コマンド認識**

- 文頭の`!dx`または`！dx`でのみ反応
- 日本語全角コマンドにも対応
- 無効なコマンドへの適切なエラーメッセージ

#### 3. **結果表示**

- 見やすい埋め込みメッセージでの結果表示
- ダイス結果の詳細表示
- 成功・失敗の明確な表示

#### 4. **ヘルプ機能**

- コマンド一覧の表示
- 使用例の提供
- Discordのスラッシュコマンドを使う

## 🛠️ 技術仕様

### 開発環境

- **言語**: TypeScript
- **ランタイム**: Node.js 18+
- バージョン管理: volta
- パッケージマネージャー: pnpm
- **主要ライブラリ**:
  - `discord.js` (^14.x) - Discord API
  - `bcdice` (^4.8.0) - ダイス処理
  - `dotenv` - 環境変数管理

### 依存関係

```json
{
  "dependencies": {
    "discord.js": "^14.14.1",
    "bcdice": "^4.8.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0",
    "tsx": "^4.6.0"
  }
}
```

### 環境変数

```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_bot_client_id
GUILD_ID=your_test_guild_id (optional for testing)
```

## 🏗️ アーキテクチャ設計

### システム構成図

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Discord API   │◄──►│   Discord Bot   │◄──►│   BCDice-JS     │
│                 │    │                 │    │                 │
│ - Message       │    │ - Command       │    │ - DoubleCross   │
│ - Events        │    │   Handler       │    │   System        │
│ - Embed         │    │ - Error         │    │ - Dice Rolling  │
│                 │    │   Handler       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### モジュール構成

#### 1. **Core Modules**

- `Bot` - メインボットクラス
- `CommandHandler` - コマンド処理
- `DiceService` - ダイス処理サービス
- `MessageFormatter` - メッセージ整形

#### 2. **Utility Modules**

- `Logger` - ログ出力
- `Config` - 設定管理
- `Validator` - 入力検証

## 📁 ディレクトリ構造

```
discord-dx-dicebot/
├── src/
│   ├── core/
│   │   ├── Bot.ts              # メインボットクラス
│   │   ├── CommandHandler.ts   # コマンド処理
│   │   └── DiceService.ts      # ダイス処理サービス
│   ├── utils/
│   │   ├── MessageFormatter.ts # メッセージ整形
│   │   ├── Logger.ts           # ログ出力
│   │   ├── Config.ts           # 設定管理
│   │   └── Validator.ts        # 入力検証
│   ├── types/
│   │   ├── Command.ts          # コマンド型定義
│   │   └── DiceResult.ts       # 結果型定義
│   └── index.ts                # エントリーポイント
├── tests/                      # テストファイル
├── docs/                       # ドキュメント
├── .env.example               # 環境変数例
├── package.json
├── tsconfig.json
└── README.md
```

## 🎮 コマンド仕様

### 基本コマンド形式

```
!dx [ダイスコマンド]
```

### コマンド例

#### 1. **基本判定**

```
!dx 8DX+5          # 基本判定
!dx 7DX8+3 もしくは !dx 7DX+3@8        # クリティカル値8で判定
!dx 10DX+15      # 大量ダイス判定
```

#### 2. **ヘルプ**

```
/dxhelp               # ヘルプ表示
```

#### 3. **システム情報**

```
/dxinfo               # ボット情報表示
```

## 💬 出力形式設計

### メッセージ

```
🎲 ダブルクロス判定結果

【コマンド】 2DX+5
【ダイス】 [8,6] + 5 = 13
【最終値】 13

```

### エラーメッセージ

```
❌ エラー

無効なコマンドです。
使用例: !dx 2DX+5

ヘルプ: /dxhelp
```

## 🔧 実装計画

### Sprint 1 (Week 1)

- [ ] プロジェクト初期設定
- [ ] Discord Bot基盤実装
- [ ] bcdice-js統合
- [ ] 基本コマンド認識

### Sprint 2 (Week 2)

- [ ] ダイス判定機能実装
- [ ] メッセージ整形機能
- [ ] エラーハンドリング
- [ ] 基本テスト作成

### Sprint 3 (Week 3)

- [ ] ヘルプ機能実装
- [ ] コマンド検証強化
- [ ] ログ機能追加
- [ ] デプロイ準備

### Sprint 4 (Week 4)

- [ ] テスト・デバッグ
- [ ] ドキュメント整備
- [ ] パフォーマンス最適化
- [ ] リリース準備

## 🔒 セキュリティ考慮事項

### 1. **入力検証**

- コマンド文字列の長さ制限
- 特殊文字のエスケープ
- 無限ループ防止

### 2. **レート制限**

- ユーザーごとのコマンド実行回数制限
- サーバーごとの利用制限

### 3. **エラーハンドリング**

- 例外の適切な処理
- スタックトレースの秘匿
- ログの適切な管理

## 📊 パフォーマンス要件

### 応答時間

- コマンド実行: 500ms以内
- ヘルプ表示: 200ms以内

### 負荷対応

- 同時接続: 100サーバー以上
- 秒間リクエスト: 10req/sec以上

## 🚀 デプロイ戦略

### 開発環境

- ローカル開発環境
- テスト用Discordサーバー

### 本番環境

- VPS
- 環境変数による設定管理
- ログ監視・アラート設定

## 🔗 参考資料

- [BCDice公式サイト](https://bcdice.org/)
- [BCDice対応システム](https://bcdice.org/systems/)
- [Discord.js ドキュメント](https://discord.js.org/)
- [TypeScript ハンドブック](https://www.typescriptlang.org/docs/)

---

**最終更新**: 2025年7月
**バージョン**: 1.0.0
**作成者**: Development Team
