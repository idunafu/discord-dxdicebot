/**
 * ログレベル
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * シンプルなLogger
 */
export class Logger {
  private static formatTime(): string {
    return new Date().toISOString();
  }

  private static formatMessage(level: LogLevel, message: string): string {
    return `[${this.formatTime()}] [${level}] ${message}`;
  }

  public static debug(message: string): void {
    console.debug(this.formatMessage(LogLevel.DEBUG, message));
  }

  public static info(message: string): void {
    console.info(this.formatMessage(LogLevel.INFO, message));
  }

  public static warn(message: string): void {
    console.warn(this.formatMessage(LogLevel.WARN, message));
  }

  public static error(message: string, error?: Error): void {
    console.error(this.formatMessage(LogLevel.ERROR, message));
    if (error) {
      console.error(error.stack);
    }
  }
} 