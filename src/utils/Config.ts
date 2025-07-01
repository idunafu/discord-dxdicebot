import { config } from 'dotenv';

// 環境変数を読み込み
config();

/**
 * アプリケーション設定
 */
export class Config {
  /**
   * Discord Bot Token
   */
  public static get DISCORD_TOKEN(): string {
    const token = process.env.DISCORD_TOKEN;
    if (!token) {
      throw new Error('DISCORD_TOKEN is required');
    }
    return token;
  }

  /**
   * Client ID
   */
  public static get CLIENT_ID(): string {
    const clientId = process.env.CLIENT_ID;
    if (!clientId) {
      throw new Error('CLIENT_ID is required');
    }
    return clientId;
  }

  /**
   * Guild ID (Optional for testing)
   */
  public static get GUILD_ID(): string | undefined {
    return process.env.GUILD_ID;
  }

  /**
   * Environment
   */
  public static get NODE_ENV(): string {
    return process.env.NODE_ENV || 'development';
  }

  /**
   * Is Development Environment
   */
  public static get isDevelopment(): boolean {
    return this.NODE_ENV === 'development';
  }

  /**
   * Is Production Environment
   */
  public static get isProduction(): boolean {
    return this.NODE_ENV === 'production';
  }
} 