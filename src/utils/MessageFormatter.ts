import { EmbedBuilder } from 'discord.js';
import type { DXDiceResult } from '../types/DiceResult.js';

/**
 * Discordメッセージフォーマッター
 */
export class MessageFormatter {
  /**
   * ダイス結果を埋め込みメッセージにフォーマット
   */
  public static formatDiceResult(result: DXDiceResult, username: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle('🎲 ダブルクロス判定結果')
      .setColor(result.isValid ? 0x00ff00 : 0xff0000)
      .setTimestamp()
      .setFooter({ text: `プレイヤー: ${username}` });

    if (!result.isValid) {
      embed.setDescription(`❌ **エラー**\n\n${result.errorMessage}\n\n使用例: \`!dx 8DX+5\``);
      return embed;
    }

    let description = `**【コマンド】** ${result.command}\n`;
    description += `**【ダイス】** ${result.dice}`;
    
    if (result.modifier !== 0) {
      const modifierStr = result.modifier > 0 ? `+${result.modifier}` : `${result.modifier}`;
      description += ` ${modifierStr} = ${result.total}`;
    } else {
      description += ` = ${result.total}`;
    }

    description += `\n**【最終値】** ${result.total}`;

    if (result.criticalCount > 0) {
      const criticalBonus = result.criticalCount * 10;
      description += `\n**【クリティカル】** ${result.criticalCount}回 (+${criticalBonus})`;
    }

    embed.setDescription(description);
    return embed;
  }

  /**
   * ヘルプメッセージを埋め込みにフォーマット
   */
  public static formatHelpMessage(): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle('📖 ダブルクロスBot ヘルプ')
      .setColor(0x3498db)
      .setTimestamp();

    let description = '**【基本コマンド】**\n';
    description += '`!dx [個数]DX[クリティカル値][修正値]`\n\n';
    
    description += '**【使用例】**\n';
    description += '`!dx 8DX+5` - 8個のダイス、修正値+5\n';
    description += '`!dx 7DX8+3` - 7個のダイス、クリティカル値8、修正値+3\n';
    description += '`!dx 10DX+0@7` - 10個のダイス、クリティカル値7、修正値なし\n\n';
    
    description += '**【説明】**\n';
    description += '• 個数: 振るダイスの数\n';
    description += '• クリティカル値: クリティカルとなる値（省略時は10）\n';
    description += '• 修正値: 最終結果に加算される値\n\n';
    
    description += '**【その他のコマンド】**\n';
    description += '`/dxhelp` - このヘルプを表示\n';
    description += '`/dxinfo` - ボット情報を表示';

    embed.setDescription(description);
    return embed;
  }

  /**
   * ボット情報メッセージを埋め込みにフォーマット
   */
  public static formatInfoMessage(): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle('🤖 ダブルクロスBot 情報')
      .setColor(0x9b59b6)
      .setTimestamp();

    let description = '**【ボット名】** DX Dice Bot\n';
    description += '**【バージョン】** 1.0.0\n';
    description += '**【対応システム】** ダブルクロス2nd,3rd\n';
    description += '**【エンジン】** BCDice v4.8.0\n\n';
    
    description += '**【機能】**\n';
    description += '• ダブルクロス専用ダイス判定\n';
    description += '• クリティカル値指定対応\n';
    description += '• 修正値自動計算\n';
    description += '• 美しい結果表示\n\n';
    
    description += '**【開発】**\n';
    description += 'TypeScript + Discord.js + BCDice-JS';

    embed.setDescription(description);
    return embed;
  }

  /**
   * エラーメッセージを埋め込みにフォーマット
   */
  public static formatErrorMessage(error: string, suggestion?: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle('❌ エラー')
      .setColor(0xe74c3c)
      .setTimestamp();

    let description = error;
    
    if (suggestion) {
      description += `\n\n**【提案】**\n${suggestion}`;
    }
    
    description += '\n\n**【ヘルプ】** `/dxhelp`';

    embed.setDescription(description);
    return embed;
  }
} 