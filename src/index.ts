import { Bot } from './core/Bot.js';
import { Logger } from './utils/Logger.js';
import { Config } from './utils/Config.js';

/**
 * アプリケーションのメインエントリーポイント
 */
async function main(): Promise<void> {
  try {
    Logger.info('Starting DX Dice Bot...');
    Logger.info(`Environment: ${Config.NODE_ENV}`);

    // ボットインスタンスを作成
    const bot = new Bot();

    // Graceful shutdown のためのシグナルハンドリング
    process.on('SIGINT', async () => {
      Logger.info('Received SIGINT, shutting down gracefully...');
      await bot.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      Logger.info('Received SIGTERM, shutting down gracefully...');
      await bot.stop();
      process.exit(0);
    });

    // エラーハンドリング
    process.on('unhandledRejection', (reason, promise) => {
      Logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    });

    process.on('uncaughtException', (error) => {
      Logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // ボットを開始
    await bot.start();
    
    Logger.info('DX Dice Bot started successfully!');
  } catch (error) {
    Logger.error('Failed to start DX Dice Bot:', error as Error);
    process.exit(1);
  }
}

// メイン関数を実行
main().catch((error) => {
  Logger.error('Fatal error in main function:', error);
  process.exit(1);
}); 