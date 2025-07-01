/* eslint-disable @typescript-eslint/no-explicit-any */
import bcdiceDefault from 'bcdice';
import type { DXDiceResult } from '../types/DiceResult.js';
import type { DiceCommand } from '../types/Command.js';
import { Logger } from '../utils/Logger.js';

// Node.js v22 以降では CommonJS モジュールからの名前付きインポートに互換性の問題が発生することがあるため、
// bcdice はデフォルトインポートしてプロパティ経由で取得する。
// 型定義が付与されていないため、必要最低限の型エイリアスを定義しておく
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DynamicLoader = any;

/**
 * ダイス処理サービス
 */
export class DiceService {
  private static loader: DynamicLoader;
  private static gameSystem: any;

  /**
   * 初期化
   */
  public static async initialize(): Promise<void> {
    try {
      // bcdiceDefault.DynamicLoader が存在しない場合に備えてフェイルセーフ
      const DL: any = (bcdiceDefault as any).DynamicLoader;
      if (!DL) {
        throw new Error('BCDice パッケージに DynamicLoader が見つかりません');
      }
      this.loader = new DL();
      this.gameSystem = await this.loader.dynamicLoad('DoubleCross');
      Logger.info('DiceService initialized with DoubleCross system');
    } catch (error) {
      Logger.error('Failed to initialize DiceService', error as Error);
      throw error;
    }
  }

  /**
   * ダイスコマンド文字列を解析
   */
  public static parseDiceCommand(command: string): DiceCommand {
    // !dx を除去
    const cleanCommand = command.replace(/^(!dx|！dx)\s+/i, '').trim();
    
    // ダブルクロス形式の解析: 8DX+5 または 7DX8+3 または 7DX+3@8
    const dxPattern = /^(\d+)DX(\d+)?([+-]\d+)?(?:@(\d+))?$/i;
    const match = cleanCommand.match(dxPattern);

    if (!match) {
      return {
        diceCount: 0,
        modifier: 0,
        originalCommand: command,
        isValid: false,
        errorMessage: 'コマンド形式が正しくありません。例: 8DX+5 または 7DX8+3'
      };
    }

    const diceCount = parseInt(match[1], 10);
    const criticalFromFormat = match[2] ? parseInt(match[2], 10) : undefined;
    const modifier = match[3] ? parseInt(match[3], 10) : 0;
    const criticalFromAt = match[4] ? parseInt(match[4], 10) : undefined;

    // クリティカル値の決定（@形式を優先）
    const criticalValue = criticalFromAt || criticalFromFormat || 10;

    return {
      diceCount,
      criticalValue,
      modifier,
      originalCommand: command,
      isValid: true
    };
  }

  /**
   * BCDice形式のコマンドを生成
   */
  private static buildBCDiceCommand(diceCommand: DiceCommand): string {
    const { diceCount, criticalValue, modifier } = diceCommand;
    
    let command = `${diceCount}DX`;
    
    if (criticalValue && criticalValue !== 10) {
      command += criticalValue;
    }
    
    if (modifier > 0) {
      command += `+${modifier}`;
    } else if (modifier < 0) {
      command += modifier;
    }

    return command;
  }

  /**
   * ダイス判定を実行
   */
  public static async rollDice(diceCommand: DiceCommand): Promise<DXDiceResult> {
    if (!diceCommand.isValid) {
      return {
        command: diceCommand.originalCommand,
        dice: '',
        rounds: [],
        modifier: 0,
        total: 0,
        rands: [],
        criticalCount: 0,
        isValid: false,
        errorMessage: diceCommand.errorMessage || 'エラーが発生しました'
      };
    }

    try {
      // --- 無限上方ロールを自前で処理する ---
      const criticalValue = diceCommand.criticalValue ?? 10;
      const modifier = diceCommand.modifier;

      let currentDice = diceCommand.diceCount;
      let accumulatedCriticals = 0; // クリティカルが発生したラウンド数
      const allRolls: number[] = [];
      const rounds: number[][] = [];
      let latestRolls: number[] = [];

      const rollD10 = () => Math.floor(Math.random() * 10) + 1; // 1〜10 の整数

      // 無限上方ロール
      while (currentDice > 0) {
        latestRolls = Array.from({ length: currentDice }, rollD10);
        rounds.push([...latestRolls]); // 各ラウンドの出目を保存
        allRolls.push(...latestRolls);

        // このラウンドでクリティカルしたダイス数を数える
        const thisRoundCriticals = latestRolls.filter(v => v >= criticalValue).length;

        if (thisRoundCriticals === 0) {
          // クリティカルが無ければ終了
          break;
        }

        // クリティカルした回数分、+10 して次のラウンドはクリティカルしたダイス数だけ振り直し
        accumulatedCriticals += 1;
        currentDice = thisRoundCriticals;
      }

      const finalHighest = Math.max(...latestRolls);
      const total = finalHighest + accumulatedCriticals * 10 + modifier;

      // 表示用: [9,1,3]→[10,7] のようにラウンドごとに括弧を付けて連結
      const diceStr = rounds
        .map(r => `[${r.join(',')}]`)
        .join('→');

      return {
        command: diceCommand.originalCommand,
        dice: diceStr,
        rounds,
        modifier,
        total,
        rands: allRolls,
        criticalCount: accumulatedCriticals,
        isValid: true
      };

    } catch (error) {
      Logger.error('Dice rolling failed', error as Error);
      return {
        command: diceCommand.originalCommand,
        dice: '',
        rounds: [],
        modifier: 0,
        total: 0,
        rands: [],
        criticalCount: 0,
        isValid: false,
        errorMessage: 'ダイス処理中にエラーが発生しました'
      };
    }
  }
} 