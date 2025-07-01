# BCDice-JS 使用ガイド

## 概要

BCDice-JSは、RubyのBCDiceダイスシステムをJavaScript/TypeScriptで使用できるようにしたライブラリです。200以上のTRPGシステムに対応し、Node.jsとブラウザ環境の両方で動作します。

## 特徴

- **多言語対応**: 200以上のTRPGシステムをサポート
- **TypeScript対応**: 完全なTypeScript型定義付き
- **柔軟なローディング**: 動的ローディングと静的ローディングの選択可能
- **カスタムテーブル**: ユーザー定義ダイステーブルの作成可能
- **国際化対応**: 多言語サポート

## インストール

```bash
npm install bcdice
```

## 基本的な使い方

### 1. DynamicLoaderを使用した基本例

```typescript
import { DynamicLoader } from 'bcdice';

async function basicDiceRoll() {
  // ローダーを作成
  const loader = new DynamicLoader();
  
  // 利用可能なゲームシステムを取得
  const availableSystems = loader.listAvailableGameSystems();
  console.log('利用可能システム:', availableSystems.map(s => s.name));
  
  // 特定のゲームシステムを読み込み
  const GameSystem = await loader.dynamicLoad('Cthulhu7th');
  
  // システム情報を確認
  console.log('システム名:', GameSystem.NAME);
  console.log('ヘルプ:', GameSystem.HELP_MESSAGE);
  
  // ダイスコマンドを実行
  const result = GameSystem.eval('CC<=54');
  
  if (result) {
    console.log('結果:', result.text);
    console.log('成功:', result.success);
    console.log('ダイス値:', result.rands);
  }
}
```

### 2. CommonJS形式の例

```javascript
const { DynamicLoader } = require('bcdice');

async function rollDice() {
  const loader = new DynamicLoader();
  const GameSystem = await loader.dynamicLoad('SwordWorld2.5');
  
  const result = GameSystem.eval('K20');
  if (result) {
    console.log(result.text);
  }
}
```

## ローディング戦略

### DynamicLoader（推奨）

- **用途**: メモリ効率を重視する場合
- **特徴**: 必要なゲームシステムのみを動的に読み込み
- **適用場面**: Webアプリケーション、少数のシステムのみ使用

```typescript
const loader = new DynamicLoader();
const GameSystem = await loader.dynamicLoad('Cthulhu7th');
```

### StaticLoader

- **用途**: パフォーマンスを重視する場合
- **特徴**: 全ゲームシステムを起動時に読み込み
- **適用場面**: デスクトップアプリ、多数のシステムを使用

```typescript
import StaticLoader from 'bcdice/lib/loader/static_loader';

const loader = new StaticLoader(); // 全システムが読み込み済み
const GameSystem = await loader.dynamicLoad('Cthulhu7th');
```

## 主要なゲームシステム例

| システムID | 名前 | コマンド例 |
|------------|------|-----------|
| `Cthulhu7th` | クトゥルフ神話TRPG 第7版 | `CC<=54` |
| `SwordWorld2.5` | ソード・ワールド2.5 | `K20`, `2D6+3` |
| `DiceBot` | 汎用ダイスボット | `2D6`, `1D100` |
| `Insane` | インセイン | `2D6+3>=9` |
| `Arianrhod` | アリアンロッド | `2D6+5>=10` |

## Result オブジェクト

ダイス評価の結果は以下の構造を持ちます：

```typescript
interface Result {
  text: string;           // 結果テキスト
  secret: boolean;        // 秘匿ロールかどうか
  success: boolean;       // 成功判定
  failure: boolean;       // 失敗判定
  critical: boolean;      // クリティカル成功
  fumble: boolean;        // ファンブル
  rands: [number, number][]; // [出目, ダイス面数]の配列
}
```

### 結果の処理例

```typescript
const result = GameSystem.eval('CC<=50');

if (result) {
  console.log(`結果: ${result.text}`);
  
  if (result.critical) {
    console.log('クリティカル成功！');
  } else if (result.fumble) {
    console.log('ファンブル...');
  } else if (result.success) {
    console.log('成功');
  } else if (result.failure) {
    console.log('失敗');
  }
  
  // 個別のダイス結果を表示
  result.rands.forEach(([value, sides], i) => {
    console.log(`ダイス${i + 1}: D${sides}で${value}`);
  });
}
```

## カスタムダイステーブル

独自のダイステーブルを作成できます：

```typescript
import { UserDefinedDiceTable } from 'bcdice';

const table = new UserDefinedDiceTable(`ランダム遭遇表
1D6
1:スライム
2:ゴブリン
3:オーク
4:トロール
5:ドラゴン
6:何も起こらない`);

const result = table.roll();
if (result) {
  console.log(`遭遇: ${result.text}`);
}
```

## エラーハンドリング

```typescript
async function safeRoll(systemId: string, command: string) {
  try {
    const loader = new DynamicLoader();
    const GameSystem = await loader.dynamicLoad(systemId);
    
    // コマンドパターンをチェック
    if (GameSystem.COMMAND_PATTERN.test(command)) {
      const result = GameSystem.eval(command);
      
      if (result) {
        return result;
      } else {
        throw new Error('コマンドの評価に失敗しました');
      }
    } else {
      throw new Error(`無効なコマンド: ${command}`);
    }
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    return null;
  }
}
```

## 国際化対応

```typescript
// 特定の言語の翻訳を読み込み
await loader.dynamicImportI18n('SomeSystem', 'en');
```

## パフォーマンス最適化

### メモリ使用量の最適化

```typescript
// 必要なシステムのみ読み込み
const neededSystems = ['Cthulhu7th', 'SwordWorld2.5'];
const loadedSystems = {};

for (const systemId of neededSystems) {
  loadedSystems[systemId] = await loader.dynamicLoad(systemId);
}
```

### キャッシュ戦略

```typescript
class CachedDiceRoller {
  private systemCache = new Map();
  private loader = new DynamicLoader();
  
  async getGameSystem(systemId: string) {
    if (!this.systemCache.has(systemId)) {
      const gameSystem = await this.loader.dynamicLoad(systemId);
      this.systemCache.set(systemId, gameSystem);
    }
    return this.systemCache.get(systemId);
  }
  
  async roll(systemId: string, command: string) {
    const GameSystem = await this.getGameSystem(systemId);
    return GameSystem.eval(command);
  }
}
```

## 主要API一覧

### DynamicLoader

| メソッド | 説明 | 戻り値 |
|----------|------|--------|
| `listAvailableGameSystems()` | 利用可能なシステム一覧 | `GameSystemInfo[]` |
| `dynamicLoad(id)` | ゲームシステムを読み込み | `Promise<GameSystemClass>` |
| `getGameSystemIdByName(name)` | 名前からIDを取得 | `string` |

### GameSystemClass

| プロパティ/メソッド | 説明 | 型 |
|-------------------|------|-----|
| `ID` | システムID | `string` |
| `NAME` | システム名 | `string` |
| `HELP_MESSAGE` | ヘルプメッセージ | `string` |
| `COMMAND_PATTERN` | コマンドパターン | `RegExp` |
| `eval(command)` | コマンド評価 | `Result \| null` |

### UserDefinedDiceTable

| メソッド | 説明 | 戻り値 |
|----------|------|--------|
| `constructor(definition)` | テーブル作成 | - |
| `roll()` | テーブルでロール | `Result \| null` |

## トラブルシューティング

### よくある問題

1. **システムが見つからない**

   ```typescript
   // 利用可能なシステムIDを確認
   console.log(loader.listAvailableGameSystems().map(s => s.id));
   ```

2. **コマンドが認識されない**

   ```typescript
   // ヘルプメッセージとパターンを確認
   console.log(GameSystem.HELP_MESSAGE);
   console.log(GameSystem.COMMAND_PATTERN);
   ```

3. **null結果の処理**

   ```typescript
   const result = GameSystem.eval(command);
   if (!result) {
     console.log('コマンドが認識されませんでした');
     return;
   }
   ```

## 次のステップ

このドキュメントを基に、Discord.jsと組み合わせてDiscordボットを作成する準備が整いました。bcdice-jsの基本的な使い方を理解したら、以下のステップでDiscordボットの実装に進みましょう：

1. Discord.jsのセットアップ
2. Discord Developer Portalでのボット作成
3. bcdice-jsとDiscord.jsの統合
4. コマンドハンドリングの実装
5. エラーハンドリングとログの設定

このドキュメントがbcdice-jsの理解と活用に役立つことを願います。
