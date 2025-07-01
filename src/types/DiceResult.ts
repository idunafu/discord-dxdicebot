/**
 * BCDice結果の型定義
 */
export interface BCDiceResult {
  text: string;
  secret: boolean;
  success: boolean;
  failure: boolean;
  critical: boolean;
  fumble: boolean;
  rands: [number, number][];
  detailedRands?: DetailedRand[];
}

/**
 * 詳細なダイス情報
 */
export interface DetailedRand {
  kind: string;
  sides: number;
  value: number;
}

/**
 * ダブルクロス用のダイス結果
 */
export interface DXDiceResult {
  command: string;
  dice: string;
  modifier: number;
  total: number;
  rands: number[];
  criticalCount: number;
  isValid: boolean;
  errorMessage?: string;
} 