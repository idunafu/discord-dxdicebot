import { DynamicLoader } from 'bcdice';
import type { BCDiceResult, DXDiceResult } from '../types/DiceResult.js';
import type { DiceCommand } from '../types/Command.js';
import { Logger } from '../utils/Logger.js';

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
      this.loader = new DynamicLoader();
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
    if (!this.gameSystem) {
      throw new Error('DiceService is not initialized');
    }

    if (!diceCommand.isValid) {
      return {
        command: diceCommand.originalCommand,
        dice: '',
        modifier: 0,
        total: 0,
        rands: [],
        criticalCount: 0,
        isValid: false,
        errorMessage: diceCommand.errorMessage || 'エラーが発生しました'
      };
    }

    try {
      const bcdiceCommand = this.buildBCDiceCommand(diceCommand);
      Logger.debug(`Executing BCDice command: ${bcdiceCommand}`);
      
      const result: BCDiceResult | null = this.gameSystem.eval(bcdiceCommand);
      
      if (!result) {
        return {
          command: diceCommand.originalCommand,
          dice: bcdiceCommand,
          modifier: diceCommand.modifier,
          total: 0,
          rands: [],
          criticalCount: 0,
          isValid: false,
          errorMessage: 'ダイス判定に失敗しました'
        };
      }

      // BCDice結果を解析
      const rands = result.rands.map(([value]) => value);
      const diceTotal = rands.reduce((sum, value) => sum + value, 0);
      const finalTotal = diceTotal + diceCommand.modifier;

      // クリティカル回数をカウント（クリティカル値以上のダイス）
      const criticalCount = rands.filter(value => 
        value >= (diceCommand.criticalValue || 10)
      ).length;

      return {
        command: diceCommand.originalCommand,
        dice: `[${rands.join(',')}]`,
        modifier: diceCommand.modifier,
        total: finalTotal,
        rands,
        criticalCount,
        isValid: true
      };

    } catch (error) {
      Logger.error('Dice rolling failed', error as Error);
      return {
        command: diceCommand.originalCommand,
        dice: '',
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