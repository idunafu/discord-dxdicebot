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
        errorMessage: diceCommand.errorMessage || 'コマンド形式が正しくありません'
      };
    }

    // BCDice がまだロードされていなければ初期化
    if (!this.gameSystem) {
      await this.initialize();
    }

    try {
      const bcdiceCommand = this.buildBCDiceCommand(diceCommand);
      const result = this.gameSystem.eval(bcdiceCommand);

      if (!result) {
        return {
          command: diceCommand.originalCommand,
          dice: '',
          rounds: [],
          modifier: diceCommand.modifier,
          total: 0,
          rands: [],
          criticalCount: 0,
          isValid: false,
          errorMessage: 'BCDice がコマンドを認識しませんでした'
        };
      }

      const parsed = this.parseBCDiceDXResult(result.text);

      return {
        command: diceCommand.originalCommand,
        dice: parsed.diceStr,
        rounds: parsed.rounds,
        modifier: diceCommand.modifier,
        total: parsed.total,
        rands: result.rands.map((v: [number, number]) => v[0]),
        criticalCount: parsed.criticalCount,
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

  /**
   * BCDice が出力する DoubleCross 用結果テキストを解析して各種情報を抽出
   */
  private static parseBCDiceDXResult(text: string): {
    diceStr: string;
    rounds: number[][];
    total: number;
    criticalCount: number;
  } {
    // 「＞」で区切る。例: (8DX10+5) ＞ 9[2,3,...]+5 ＞ 14
    const parts = text.split('＞').map(p => p.trim());

    if (parts.length < 3) {
      throw new Error(`結果テキストの解析に失敗: ${text}`);
    }

    const dicePartRaw = parts[1];

    // 総合値は 3 パート目の先頭の数値を利用
    const totalMatch = parts[2].match(/\d+/);
    const total = totalMatch ? parseInt(totalMatch[0], 10) : 0;

    // 各ラウンドのダイス出目 [2,3,4] 部分を抽出
    const bracketRegex = /\[([^\]]+)\]/g;
    const rounds: number[][] = [];
    let m: RegExpExecArray | null;
    while ((m = bracketRegex.exec(dicePartRaw)) !== null) {
      const nums = m[1]
        .split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !Number.isNaN(n));
      rounds.push(nums);
    }

    const diceStr = rounds.map(r => `[${r.join(',')}]`).join('→');
    const criticalCount = Math.max(0, rounds.length - 1);

    return { diceStr, rounds, total, criticalCount };
  }
} 