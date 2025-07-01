/* eslint-disable @typescript-eslint/no-explicit-any */
import bcdiceDefault from 'bcdice';

// Node.js v22 以降との互換性を保つため、bcdice は CommonJS 形式でエクスポートされる
// デフォルトインポート経由で DynamicLoader を取得する
const DynamicLoader: any = (bcdiceDefault as any).DynamicLoader;

/**
 * DoubleCross の無限上方ロールを bcdice-js がどのように処理するかを検証する簡易スクリプト。
 * 
 * 実行例:
 *   npx tsx src/tests/bcdice_infinite_critical_test.ts | bunyan
 */
async function main(): Promise<void> {
  // DynamicLoader を利用して必要なゲームシステムのみ読み込む
  const loader = new DynamicLoader();
  const GameSystem = await loader.dynamicLoad('DoubleCross');

  // テストしたいコマンドを配列で列挙
  const commands = [
    '8DX+5',      // クリティカル値 10、修正 +5
    '7DX8+3',     // クリティカル値 8（書式指定）、修正 +3
    '7DX+3@8',    // @ を使ったクリティカル値 8 指定、修正 +3
    '10DX>=15+2', // 難易度付きの例（成否判定も確認）
  ];

  for (const command of commands) {
    const result = GameSystem.eval(command);
    console.log('----------------------------------------');
    console.log(`コマンド: ${command}`);

    if (!result) {
      console.log('   → コマンドが認識されませんでした');
      continue;
    }

    console.log(`結果テキスト: ${result.text}`);
    console.log(`secret: ${result.secret}`);
    console.log(`success: ${result.success}`);
    console.log(`failure: ${result.failure}`);
    console.log(`critical: ${result.critical}`);
    console.log(`fumble: ${result.fumble}`);

    // 出目情報
    console.log('rands:', result.rands);
  }
}

// エントリポイント
main().catch(err => {
  console.error('エラーが発生しました', err);
  process.exit(1);
}); 