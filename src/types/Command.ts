import { Message } from 'discord.js';

/**
 * ダイスコマンドの解析結果
 */
export interface DiceCommand {
  diceCount: number;
  criticalValue?: number;
  modifier: number;
  originalCommand: string;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * メッセージハンドラーのインターface
 */
export interface MessageHandler {
  handle(message: Message): Promise<void>;
}

/**
 * コマンドプレフィックス
 */
export const COMMAND_PREFIX = '!dx' as const;
export const COMMAND_PREFIX_ZENKAKU = '！dx' as const;

/**
 * コマンドタイプ
 */
export enum CommandType {
  DICE = 'dice',
  HELP = 'help',
  INFO = 'info',
  UNKNOWN = 'unknown'
}

/**
 * 解析されたコマンド
 */
export interface ParsedCommand {
  type: CommandType;
  args: string[];
  originalMessage: string;
} 